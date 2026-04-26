/**
 * Glue between the pending-payment modal and the awaiting `pay.simulate`
 * promise. The modal calls approvePayment / rejectPayment; we resolve the
 * promise the runtime is awaiting, optionally adding a real ledger row.
 */

import { agentActions, getAgent } from '../store/useAgentStore.js';
import { actions as financeActions } from '../store/useFinanceStore.js';

export function approvePayment() {
  const p = getAgent().pendingPayment;
  if (!p) return;

  const txId = financeActions.addTransaction({
    date: p.date,
    amount: p.amount,
    category: p.category,
    description: p.payee,
    simulated: true,
  });

  agentActions.clearPendingPayment();
  p.resolve?.({ approved: true, txId });
}

export function rejectPayment() {
  const p = getAgent().pendingPayment;
  if (!p) return;
  agentActions.clearPendingPayment();
  p.resolve?.({ approved: false });
}
