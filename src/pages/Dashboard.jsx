import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore, actions } from '../store/useFinanceStore.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { money, dateShort, pct } from '../utils/format.js';
import { monthOf, today } from '../utils/date.js';
import {
  inMonth,
  totals,
  spendByCategory,
  dailySpend,
  topExpenses,
  savingsProgress,
} from '../utils/analytics.js';
import StatCard from '../components/StatCard.jsx';
import CategoryPie from '../components/charts/CategoryPie.jsx';
import SpendBar from '../components/charts/SpendBar.jsx';

/**
 * Dashboard: at-a-glance picture of this month + a placeholder agent insight.
 *
 * The insight card is intentionally deterministic right now — it's a quick
 * heuristic so the page feels alive.
 */
export default function Dashboard() {
  const { transactions, profile } = useFinanceStore();
  const ym = monthOf(today());

  const monthTx = useMemo(() => inMonth(transactions, ym), [transactions, ym]);
  const t = useMemo(() => totals(monthTx), [monthTx]);
  const byCat = useMemo(() => spendByCategory(monthTx), [monthTx]);
  const series = useMemo(() => dailySpend(transactions, 30), [transactions]);
  const top = useMemo(() => topExpenses(monthTx, 5), [monthTx]);
  const goal = useMemo(() => savingsProgress(transactions, profile.savingsGoal), [transactions, profile.savingsGoal]);
  const quickInsight = useMemo(() => quickHeuristicInsight(monthTx, byCat, t), [monthTx, byCat, t]);

  const savingsRate = t.income > 0 ? Math.max(0, t.net / t.income) : 0;

  if (transactions.length === 0) {
    return (
      <section className="page">
        <div className="page-head">
          <h2 className="page-title">Hey {profile.name || 'there'}</h2>
          <p className="page-sub">Your ledger is empty — add your first transaction or load demo data to see the agent in action.</p>
        </div>
        <div className="card empty-hero">
          <div className="empty-hero-glyph">∅</div>
          <h3 className="empty-hero-title">Nothing logged yet</h3>
          <p className="empty-hero-body">
            FinanceBuddy AI's charts, insights, and report skill all read from your transaction ledger. Add a row by hand or pull in the polished demo dataset to explore the workflow.
          </p>
          <div className="empty-hero-actions">
            <Link to="/transactions" className="btn btn-primary">+ Add transaction</Link>
            <button className="btn btn-ghost" onClick={() => actions.loadDemo()}>Load demo data</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">Hey {profile.name || 'there'}</h2>
        <p className="page-sub">Here's how {monthLabel(ym)} is shaping up.</p>
      </div>

      <div className="grid grid-4">
        <StatCard
          tone="income"
          label="Income · this month"
          value={money(t.income, profile.currency)}
          hint={t.income > 0 ? 'Money in' : 'No income logged yet'}
        />
        <StatCard
          tone="expense"
          label="Expenses · this month"
          value={money(t.expense, profile.currency)}
          hint={`${monthTx.filter((x) => x.amount < 0).length} transactions`}
        />
        <StatCard
          tone={t.net >= 0 ? 'positive' : 'negative'}
          label="Net"
          value={money(t.net, profile.currency)}
          hint={t.income > 0 ? `Savings rate ${pct(savingsRate, 0)}` : '—'}
        />
        <StatCard
          tone="accent"
          label="Savings goal"
          value={money(goal.saved, profile.currency)}
          hint={profile.savingsGoal > 0
            ? `${pct(goal.pct, 0)} of ${money(goal.goal, profile.currency)} target`
            : 'Set a goal in Settings'}
          progress={goal.pct}
        />
      </div>

      <div className="grid grid-3" style={{ marginTop: 'var(--s-5)' }}>
        <div className="card chart-card" style={{ gridColumn: 'span 1' }}>
          <div className="card-head">
            <h3 className="card-title">Spending by category</h3>
            <span className="pill pill-info">{monthLabel(ym)}</span>
          </div>
          <CategoryPie data={byCat} currency={profile.currency} />
        </div>

        <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-head">
            <h3 className="card-title">Daily spend · last 30 days</h3>
            <span className="pill">weekends in amber</span>
          </div>
          <SpendBar data={series} currency={profile.currency} />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 'var(--s-5)' }}>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Top expenses this month</h3>
            <Link to="/transactions" className="pill pill-info">View all →</Link>
          </div>
          {top.length === 0 ? (
            <div className="placeholder-card" style={{ border: 'none' }}>
              No expenses logged for {monthLabel(ym)} yet.
            </div>
          ) : (
            <ul className="tx-list" style={{ marginLeft: -8, marginRight: -8 }}>
              {top.map((tx) => {
                const cat = CATEGORY_BY_ID[tx.category] ?? CATEGORY_BY_ID.other;
                return (
                  <li key={tx.id} className="tx-row">
                    <span className="tx-icon" style={{ color: cat.color }}>{cat.icon}</span>
                    <span className="tx-desc">
                      <span className="tx-title">{tx.description}</span>
                      <span className="tx-meta">{cat.label} · {dateShort(tx.date)}</span>
                    </span>
                    <span className="tx-amt neg">{money(tx.amount, profile.currency)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card insight-card">
          <div className="card-head">
            <h3 className="card-title">Agent insight</h3>
            <span className="pill pill-ok">deterministic</span>
          </div>
          <p className="insight-body">{quickInsight.body}</p>
          {quickInsight.detail && <p className="insight-detail">{quickInsight.detail}</p>}
          <div className="insight-foot">
            <Link to="/agent" className="btn btn-primary btn-sm">Open agent workflow →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/**
 * Lightweight heuristic so the insight card has something real to show.
 * Step 7 replaces this with the actual `insights` skill output.
 */
function quickHeuristicInsight(monthTx, byCat, t) {
  if (monthTx.length === 0) {
    return {
      body: 'No transactions yet this month — add a few to see your patterns.',
      detail: null,
    };
  }
  if (byCat.length === 0) {
    return {
      body: 'You have income this month but no expenses logged yet. Nice cushion!',
      detail: null,
    };
  }
  const top = byCat[0];
  const share = Math.round(top.pct * 100);
  if (t.net < 0) {
    return {
      body: `You're spending more than you earn this month — net ${Math.round(Math.abs(t.net))} in the red.`,
      detail: `Biggest category is ${top.label.toLowerCase()} (${share}% of expenses). Worth a look.`,
    };
  }
  if (share >= 35) {
    return {
      body: `${top.label} is taking ${share}% of your spending this month.`,
      detail: 'Healthy budgets usually keep any single category under 30%.',
    };
  }
  return {
    body: `Spending looks balanced — top category (${top.label.toLowerCase()}) is only ${share}%.`,
    detail: 'Keep going. The agent will flag anything risky as it appears.',
  };
}
