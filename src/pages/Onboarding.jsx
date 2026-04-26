import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { actions } from '../store/useFinanceStore.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    currency: 'USD',
    monthlyIncome: '',
    savingsGoal: '',
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    actions.completeOnboarding({
      name: form.name.trim() || 'Friend',
      currency: form.currency,
      monthlyIncome: Number(form.monthlyIncome) || 0,
      savingsGoal: Number(form.savingsGoal) || 0,
    });
    navigate('/', { replace: true });
  };

  const skip = () => {
    actions.completeOnboarding({});
    navigate('/', { replace: true });
  };

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={'onboarding-dot' + (i <= step ? ' on' : '')} />
          ))}
        </div>

        {step === 0 && (
          <>
            <h1>Welcome to FinanceBuddy AI</h1>
            <p>
              Your local-first finance agent. Everything stays in this browser —
              no cloud, no signup. Let's get to know you.
            </p>
            <label className="label" htmlFor="name">What should I call you?</label>
            <input
              id="name"
              className="input"
              autoFocus
              placeholder="e.g. Alex"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            <label className="label" htmlFor="currency" style={{ marginTop: 12 }}>Currency</label>
            <select
              id="currency"
              className="select"
              value={form.currency}
              onChange={(e) => update({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={skip}>Skip — load demo</button>
              <button className="btn btn-primary" onClick={next}>Continue</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Monthly income</h1>
            <p>Roughly how much do you take home each month? Used to gauge runway and savings room.</p>
            <label className="label" htmlFor="income">Monthly take-home ({form.currency})</label>
            <input
              id="income"
              className="input"
              type="number"
              min="0"
              autoFocus
              placeholder="e.g. 5000"
              value={form.monthlyIncome}
              onChange={(e) => update({ monthlyIncome: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={back}>Back</button>
              <button className="btn btn-primary" onClick={next}>Continue</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Savings goal</h1>
            <p>How much would you like to save each month? Your saver skill will compare actuals against this.</p>
            <label className="label" htmlFor="goal">Monthly savings goal ({form.currency})</label>
            <input
              id="goal"
              className="input"
              type="number"
              min="0"
              autoFocus
              placeholder="e.g. 800"
              value={form.savingsGoal}
              onChange={(e) => update({ savingsGoal: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={back}>Back</button>
              <button className="btn btn-primary" onClick={next}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>You're all set, {form.name.trim() || 'friend'}</h1>
            <p>FinanceBuddy AI is ready. The agent will start analysing your transactions on the dashboard.</p>
            <div className="onboarding-summary">
              <Row label="Currency" value={form.currency} />
              <Row label="Monthly income" value={form.monthlyIncome || '—'} />
              <Row label="Savings goal" value={form.savingsGoal || '—'} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={back}>Back</button>
              <button className="btn btn-primary" onClick={finish}>Open dashboard</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="onboarding-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
