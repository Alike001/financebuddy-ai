import { inMonth, totals, spendByCategory, savingsProgress } from '../../utils/analytics.js';
import { getFinance } from '../../store/useFinanceStore.js';
import { monthOf, today } from '../../utils/date.js';

/**
 * Report skill: a single-paragraph human-readable monthly summary, written in
 * the SOUL.md voice (friendly buddy, headline-first). Stored on the agent
 * store so the Reports page (Step 11) can display the most recent one.
 */

export const report = {
  id: 'report',
  label: 'Monthly report',
  description: 'Writes a one-paragraph plain-English summary of the month.',

  async *run({ tools, emit, sleep }) {
    yield emit({ type: 'thought', text: 'Composing the month\'s narrative…' });
    await sleep(280);

    const { profile } = getFinance();
    const ym = monthOf(today());
    const monthTx = inMonth(tools.ledger.list(), ym);
    const t = totals(monthTx);
    const byCat = spendByCategory(monthTx);
    const goal = savingsProgress(tools.ledger.list(), profile.savingsGoal);

    const monthName = new Date(ym + '-01').toLocaleDateString(undefined, { month: 'long' });
    const top = byCat[0];

    let body;
    if (monthTx.length === 0) {
      body = `${monthName} is a blank slate so far — no transactions logged. Add a few and run me again for a real report.`;
    } else {
      const headline = t.net >= 0
        ? `${monthName} netted you $${Math.round(t.net)}`
        : `${monthName} ran $${Math.round(Math.abs(t.net))} in the red`;

      const topLine = top
        ? ` Your biggest bucket was ${top.label.toLowerCase()} at ${Math.round(top.pct * 100)}% of expenses.`
        : '';

      const goalLine = profile.savingsGoal > 0
        ? (goal.pct >= 1
            ? ` Savings goal hit — $${Math.round(goal.saved)} of $${Math.round(goal.goal)}.`
            : ` Savings $${Math.round(goal.saved)} of $${Math.round(goal.goal)} (${Math.round(goal.pct * 100)}% of goal).`)
        : '';

      body = `${headline} on $${Math.round(t.income)} in and $${Math.round(Math.abs(t.expense))} out across ${monthTx.length} transactions.${topLine}${goalLine}`;
    }

    yield emit({
      type: 'finding',
      severity: 'info',
      title: `${monthName} report`,
      body,
    });

    return { month: ym, body, totals: t };
  },
};
