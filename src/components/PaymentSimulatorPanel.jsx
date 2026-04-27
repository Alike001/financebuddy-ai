/**
 * Payment Simulator panel.
 *
 * Lives on the Agent Workflow page. Lets a user trigger the same human-in-
 * the-loop payment flow the saver skill uses, but as a one-off action — picks
 * a preset (rent, electricity, etc.) and the modal pops up.
 *
 * Under the hood: we open a tiny "manual run" on the agent timeline so the
 * proposal narrates itself the same way a skill-driven payment does. That
 * keeps the demo coherent — every payment is something the agent reasoned
 * about, never a raw form submit.
 */

import { useState } from 'react';
import { useAgentStore, agentActions } from '../store/useAgentStore.js';
import { useFinanceStore } from '../store/useFinanceStore.js';
import { tools } from '../agent/tools/index.js';
import { money } from '../utils/format.js';

const PRESETS = [
  { id: 'rent',     payee: 'Landlord',          amount: 1500, category: 'rent',     reason: 'Monthly rent', glyph: '⌂' },
  { id: 'electric', payee: 'Electric utility',  amount: 95,   category: 'bills',    reason: 'Electricity bill', glyph: '⚡' },
  { id: 'gym',      payee: 'Gym membership',    amount: 35,   category: 'bills',    reason: 'Recurring subscription', glyph: '★' },
  { id: 'topup',    payee: 'Savings account',   amount: 200,  category: 'savings',  reason: 'Manual top-up', glyph: '▲' },
];

export default function PaymentSimulatorPanel() {
  const { status, pendingPayment } = useAgentStore();
  const { profile } = useFinanceStore();
  const blocked = status === 'running' || !!pendingPayment;
  const [custom, setCustom] = useState({ payee: '', amount: '', reason: '' });

  async function propose(p) {
    if (blocked) return;
    runManualPayment(p);
  }

  function submitCustom(e) {
    e.preventDefault();
    if (blocked) return;
    const amount = Number(custom.amount);
    if (!custom.payee.trim() || !Number.isFinite(amount) || amount <= 0) return;
    runManualPayment({
      payee: custom.payee.trim(),
      amount,
      category: 'other',
      reason: custom.reason.trim() || 'Custom payment',
    });
    setCustom({ payee: '', amount: '', reason: '' });
  }

  return (
    <div className="card simulator-card">
      <div className="card-head">
        <div>
          <div className="card-title">Payment Simulator</div>
          <div className="timeline-summary">
            Pick a preset and the agent will route it through the same approval gate the saver skill uses.
          </div>
        </div>
        <span className="pill pill-info">{profile.currency} · simulated</span>
      </div>

      <div className="sim-presets">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className="sim-preset"
            onClick={() => propose(p)}
            disabled={blocked}
            title={`Propose ${money(p.amount, profile.currency)} to ${p.payee}`}
          >
            <span className="sim-preset-glyph">{p.glyph}</span>
            <div className="sim-preset-body">
              <div className="sim-preset-title">{p.payee}</div>
              <div className="sim-preset-meta">{money(p.amount, profile.currency)} · {p.reason}</div>
            </div>
          </button>
        ))}
      </div>

      <form className="sim-custom" onSubmit={submitCustom}>
        <div className="sim-custom-row">
          <input
            className="input sim-custom-payee"
            placeholder="Custom payee (e.g. Coffee shop)"
            value={custom.payee}
            onChange={(e) => setCustom((c) => ({ ...c, payee: e.target.value }))}
            disabled={blocked}
          />
          <input
            className="input sim-custom-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={custom.amount}
            onChange={(e) => setCustom((c) => ({ ...c, amount: e.target.value }))}
            disabled={blocked}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={blocked || !custom.payee.trim() || !Number(custom.amount)}
          >
            Propose
          </button>
        </div>
      </form>

      {blocked && (
        <p className="sim-foot">
          {pendingPayment ? 'Resolve the pending approval before proposing another.' : 'Agent is running — wait for the current goal to finish.'}
        </p>
      )}
    </div>
  );
}

/**
 * Open a tiny "manual" run on the agent timeline, so the user-triggered
 * payment shows up the same way a saver-driven one does. The actual await
 * happens here — the modal resolves the Promise.
 */
async function runManualPayment(p) {
  agentActions.startRun({ goalId: 'manual-pay', goalLabel: `Manual payment: ${p.payee}` });

  await sleep(160);
  agentActions.emit({
    type: 'thought',
    text: `You're proposing $${p.amount} to ${p.payee}. Routing through the approval gate.`,
  });

  await sleep(180);
  agentActions.emit({
    type: 'tool:call',
    tool: 'pay',
    action: 'simulate',
    args: { payee: p.payee, amount: p.amount, category: p.category },
    result: 'awaiting human approval',
  });

  const result = await tools.pay.simulate(p);

  if (result.approved) {
    agentActions.emit({
      type: 'finding',
      severity: 'good',
      title: `Approved — $${p.amount} sent to ${p.payee}`,
      body: 'The ledger now has a simulated row for this transaction.',
    });
    tools.notify.toast(`Paid ${p.payee} · $${p.amount}`, 'ok');
  } else {
    agentActions.emit({
      type: 'finding',
      severity: 'info',
      title: 'Payment rejected',
      body: 'No money moved. The simulator is yours.',
    });
  }

  const summary = result.approved
    ? `Manual payment to ${p.payee} processed.`
    : `Manual payment to ${p.payee} cancelled.`;
  agentActions.emit({ type: 'goal:done', summary });
  agentActions.finish(summary);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
