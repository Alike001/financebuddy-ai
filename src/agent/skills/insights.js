import {
  inMonth,
  totals,
  spendByCategory,
} from '../../utils/analytics.js';
import { isWeekend, monthOf, today } from '../../utils/date.js';

/**
 * Insights skill: scan the current month for risky patterns and emit findings.
 *
 * Patterns checked:
 *   1. Net-negative month (spending more than earning)
 *   2. Single category dominating (>= 35% of expenses)
 *   3. Weekend overspend (weekend share of spend > 40%)
 *   4. Subscription stack (>= 4 monthly subscriptions in bills)
 *
 * Each finding is severity 'warn' or 'info'. The runtime decides how to render.
 */

export const insights = {
  id: 'insights',
  label: 'Pattern spotter',
  description: 'Flags risky spending patterns the eye usually misses.',

  async *run({ tools, emit, sleep }) {
    yield emit({ type: 'thought', text: 'Pulling this month\'s transactions…' });
    await sleep(220);

    const ym = monthOf(today());
    const monthTx = inMonth(tools.ledger.list(), ym);
    const t = totals(monthTx);
    const byCat = spendByCategory(monthTx);

    yield emit({
      type: 'thought',
      text: `Looking at ${monthTx.length} transactions across ${byCat.length} categories.`,
    });
    await sleep(260);

    let count = 0;

    // 1. Deficit
    if (t.net < 0 && t.income > 0) {
      count += 1;
      yield emit({
        type: 'finding',
        severity: 'warn',
        title: 'Spending is outpacing income',
        body: `You're $${Math.round(Math.abs(t.net))} in the red this month. Even trimming one category by 15% would put you back even.`,
      });
    }

    // 2. Top-category dominance
    if (byCat.length > 0) {
      const top = byCat[0];
      if (top.pct >= 0.35) {
        count += 1;
        yield emit({
          type: 'finding',
          severity: 'warn',
          title: `${top.label} is ${Math.round(top.pct * 100)}% of your spending`,
          body: `When one bucket gets above ~30% it tends to crowd out savings. Worth a closer look.`,
          action: { label: 'See category', href: `/transactions?cat=${top.id}` },
        });
      }
    }

    // 3. Weekend overspend
    const expenseTx = monthTx.filter((x) => x.amount < 0);
    const expenseSum = expenseTx.reduce((s, x) => s + Math.abs(x.amount), 0);
    const weekendSum = expenseTx
      .filter((x) => isWeekend(x.date))
      .reduce((s, x) => s + Math.abs(x.amount), 0);
    const weekendShare = expenseSum > 0 ? weekendSum / expenseSum : 0;
    if (weekendShare > 0.4) {
      count += 1;
      yield emit({
        type: 'finding',
        severity: 'warn',
        title: 'Weekends are hitting harder than weekdays',
        body: `${Math.round(weekendShare * 100)}% of your spending lands on Saturday or Sunday. Worth pre-deciding a weekend budget.`,
      });
    }

    // 4. Subscription stack
    const subKeywords = ['netflix', 'spotify', 'icloud', 'youtube', 'subscription', 'apple music', 'hulu', 'disney', 'prime'];
    const subs = expenseTx.filter((x) =>
      x.category === 'bills' &&
      subKeywords.some((k) => x.description.toLowerCase().includes(k)),
    );
    if (subs.length >= 4) {
      count += 1;
      const total = subs.reduce((s, x) => s + Math.abs(x.amount), 0);
      yield emit({
        type: 'finding',
        severity: 'info',
        title: `${subs.length} subscriptions running`,
        body: `That's $${Math.round(total)} per month on recurring bills. A 30-second audit usually finds at least one you can cut.`,
      });
    }

    if (count === 0) {
      yield emit({
        type: 'finding',
        severity: 'good',
        title: 'No risky patterns this month',
        body: 'Spending is balanced and you\'re not in the red. Keep going.',
      });
    }

    return { count };
  },
};
