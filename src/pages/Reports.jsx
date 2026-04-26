/**
 * Reports — monthly summary page.
 *
 * Shows the same narrative the `report` agent skill writes, the totals it
 * reasons over, and the charts that back it up. The page is deterministic:
 * pick any month, see the same composition function applied to that slice.
 *
 * The "Re-run report skill" button is a demo affordance — kicks off the agent
 * runtime so judges can hop to the Workflow page and watch the timeline
 * animate. The page itself doesn't depend on the agent ever having run.
 */

import { useMemo, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore.js';
import { useAgentStore } from '../store/useAgentStore.js';
import {
  composeMonthlyReport,
  listAvailableMonths,
  monthShort,
  dailySpendOfMonth,
} from '../utils/report.js';
import { runGoal } from '../agent/runtime.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { money, dateShort } from '../utils/format.js';
import StatCard from '../components/StatCard.jsx';
import CategoryPie from '../components/charts/CategoryPie.jsx';
import SpendBar from '../components/charts/SpendBar.jsx';

export default function Reports() {
  const { transactions, profile } = useFinanceStore();
  const { status, pendingPayment } = useAgentStore();
  const blocked = status === 'running' || !!pendingPayment;

  const months = useMemo(() => listAvailableMonths(transactions, 6), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const ym = months.includes(selectedMonth) ? selectedMonth : months[0];

  const report = useMemo(
    () => composeMonthlyReport(transactions, profile, ym),
    [transactions, profile, ym],
  );
  const dailyData = useMemo(
    () => dailySpendOfMonth(transactions, ym),
    [transactions, ym],
  );

  const isCurrent = ym === months[0];
  const isEmpty = report.monthTx.length === 0;

  const goalPct = profile.savingsGoal > 0
    ? Math.min(report.goalProgress.saved / profile.savingsGoal, 1)
    : 0;
  const netTone = report.totals.net >= 0 ? 'positive' : 'negative';

  return (
    <section className="page">
      <div className="page-head workflow-head">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-sub">
            One-paragraph monthly summaries written by the <code className="tl-code">report</code> skill, with the math that backs them up.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => runGoal('write-report')}
          disabled={blocked}
          title="Run the report skill on the current month"
        >
          ▷ Re-run report skill
        </button>
      </div>

      {/* Month picker */}
      <div className="month-tabs">
        {months.map((m) => (
          <button
            key={m}
            className={`month-tab ${m === ym ? 'on' : ''}`}
            onClick={() => setSelectedMonth(m)}
          >
            {monthShort(m)}
          </button>
        ))}
      </div>

      {/* Hero narrative */}
      <div className="card report-hero">
        <div className="report-hero-head">
          <div>
            <div className="report-hero-eyebrow">{isCurrent ? 'This month' : 'Selected month'}</div>
            <h3 className="report-hero-title">{report.monthName}</h3>
          </div>
          <span className="pill pill-info">written by <code className="tl-code">report</code> skill</span>
        </div>
        <blockquote className="report-narrative">
          <span className="report-narrative-mark">“</span>
          {report.body}
        </blockquote>
        <div className="report-hero-foot">
          <span className="report-foot-meta">{report.monthTx.length} transactions</span>
          <span className="report-foot-meta-sep">·</span>
          <span className="report-foot-meta">net {money(report.totals.net, profile.currency)}</span>
          {profile.savingsGoal > 0 && (
            <>
              <span className="report-foot-meta-sep">·</span>
              <span className="report-foot-meta">savings {Math.round(report.goalProgress.pct * 100)}% of goal</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4">
        <StatCard
          label="Income"
          value={money(report.totals.income, profile.currency)}
          hint={isEmpty ? 'No income logged' : 'Money in'}
          tone="income"
        />
        <StatCard
          label="Expenses"
          value={money(-Math.abs(report.totals.expense), profile.currency)}
          hint={isEmpty ? 'No spending logged' : 'Money out'}
          tone="expense"
        />
        <StatCard
          label="Net"
          value={money(report.totals.net, profile.currency)}
          hint={report.totals.net >= 0 ? 'In the black' : 'In the red'}
          tone={netTone}
        />
        <StatCard
          label="Savings goal"
          value={profile.savingsGoal > 0
            ? money(report.goalProgress.saved, profile.currency)
            : '—'}
          hint={profile.savingsGoal > 0
            ? `of ${money(profile.savingsGoal, profile.currency)} target`
            : 'Set a goal in Settings'}
          tone="accent"
          progress={profile.savingsGoal > 0 ? goalPct : undefined}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-3 report-charts">
        <div className="card chart-card report-bar-card">
          <div className="card-head">
            <div className="card-title">Daily spend · {report.monthName}</div>
            <span className="report-foot-meta">weekend bars in amber</span>
          </div>
          <SpendBar data={dailyData} currency={profile.currency} />
        </div>
        <div className="card chart-card report-pie-card">
          <div className="card-head">
            <div className="card-title">By category</div>
          </div>
          {report.byCategory.length === 0 ? (
            <div className="placeholder-card" style={{ border: 'none' }}>
              No expenses to chart for this month.
            </div>
          ) : (
            <CategoryPie data={report.byCategory} currency={profile.currency} />
          )}
        </div>
      </div>

      {/* Top expenses */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Top 5 expenses</div>
          <span className="report-foot-meta">{report.monthName}</span>
        </div>
        {report.top.length === 0 ? (
          <div className="placeholder-card" style={{ border: 'none' }}>
            No expenses logged this month.
          </div>
        ) : (
          <ol className="top-list">
            {report.top.map((t, i) => {
              const cat = CATEGORY_BY_ID[t.category];
              return (
                <li key={t.id} className="top-row">
                  <span className="top-rank">{i + 1}</span>
                  <span
                    className="top-cat-dot"
                    style={{ background: cat?.color || 'var(--c-text-dim)' }}
                  />
                  <div className="top-body">
                    <div className="top-title">{t.description}</div>
                    <div className="top-meta">
                      {cat?.label || t.category}
                      <span className="top-sep">·</span>
                      {dateShort(t.date)}
                      {t.simulated && (
                        <>
                          <span className="top-sep">·</span>
                          <code className="tl-code">simulated</code>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="top-amt">{money(t.amount, profile.currency)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
