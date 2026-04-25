import { useFinanceStore } from '../store/useFinanceStore.js';
import { money } from '../utils/format.js';

export default function Dashboard() {
  const state = useFinanceStore();
  const income = state.transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = state.transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const net = income + expenses;

  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-sub">
          Hello {state.profile.name || 'there'}. Polished cards and charts arrive in step 6 —
          for now this is a sanity readout proving the data layer is wired.
        </p>
      </div>
      <div className="grid grid-3">
        <div className="card stat">
          <div className="stat-label">Income · last 60 days</div>
          <div className="stat-value">{money(income, state.profile.currency)}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Expenses · last 60 days</div>
          <div className="stat-value">{money(expenses, state.profile.currency)}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Net</div>
          <div className={'stat-value ' + (net >= 0 ? 'stat-delta up' : 'stat-delta down')}>
            {money(net, state.profile.currency)}
          </div>
        </div>
      </div>
      <div className="placeholder-card" style={{ marginTop: 24 }}>
        Loaded <strong>{state.transactions.length}</strong> seed transactions ·
        full dashboard with charts arrives in step 6.
      </div>
    </section>
  );
}
