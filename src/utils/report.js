/**
 * Pure monthly-report composer.
 *
 * Two callers share this:
 *   - the `report` agent skill (so the timeline emits a finding with `body`)
 *   - the Reports page (so it can render a report for any selected month
 *     without re-running the agent)
 *
 * The narrative voice is the same one declared in workspace/SOUL.md —
 * headline first, plain language, no moralizing.
 */

import {
  inMonth,
  totals,
  spendByCategory,
  topExpenses,
  savingsProgress,
} from './analytics.js';
import { monthOf, today } from './date.js';

export function listAvailableMonths(transactions, max = 6) {
  const set = new Set();
  for (const t of transactions) set.add(monthOf(t.date));
  set.add(monthOf(today()));   // always include current month, even if empty
  return Array.from(set).sort().reverse().slice(0, max);
}

export function monthLabel(ym) {
  const d = new Date(ym + '-01T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function monthShort(ym) {
  const d = new Date(ym + '-01T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Daily-spend series for every day of the given month.
 * Bar chart reads left-to-right like a calendar.
 */
export function dailySpendOfMonth(transactions, ym) {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();   // last day of month
  const buckets = [];
  for (let d = 1; d <= last; d++) {
    const iso = `${ym}-${String(d).padStart(2, '0')}`;
    buckets.push({ date: iso, short: String(d), value: 0 });
  }
  const map = new Map(buckets.map((b) => [b.date, b]));
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const b = map.get(t.date);
    if (b) b.value += Math.abs(t.amount);
  }
  return buckets;
}

export function composeMonthlyReport(transactions, profile, ym) {
  const monthTx = inMonth(transactions, ym);
  const t = totals(monthTx);
  const byCategory = spendByCategory(monthTx);
  const top = topExpenses(monthTx, 5);
  const goal = savingsProgress(transactions, profile.savingsGoal);
  const monthName = monthLabel(ym);
  const top1 = byCategory[0];

  let body;
  if (monthTx.length === 0) {
    body = `${monthName} is a blank slate so far — no transactions logged. Add a few and check back for a real report.`;
  } else {
    const headline = t.net >= 0
      ? `${monthName} netted you $${Math.round(t.net)}`
      : `${monthName} ran $${Math.round(Math.abs(t.net))} in the red`;

    const flowLine = ` on $${Math.round(t.income)} in and $${Math.round(Math.abs(t.expense))} out across ${monthTx.length} transactions.`;

    const topLine = top1
      ? ` Your biggest bucket was ${top1.label.toLowerCase()} at ${Math.round(top1.pct * 100)}% of expenses.`
      : '';

    const goalLine = profile.savingsGoal > 0
      ? (goal.pct >= 1
          ? ` Savings goal hit — $${Math.round(goal.saved)} of $${Math.round(goal.goal)}.`
          : ` Savings $${Math.round(goal.saved)} of $${Math.round(goal.goal)} (${Math.round(goal.pct * 100)}% of goal).`)
      : '';

    body = `${headline}${flowLine}${topLine}${goalLine}`;
  }

  return {
    month: ym,
    monthName,
    body,
    monthTx,
    totals: t,
    byCategory,
    top,
    goalProgress: goal,
  };
}
