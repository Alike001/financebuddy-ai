import { savingsProgress, totals, inMonth } from '../../utils/analytics.js';
import { getFinance } from '../../store/useFinanceStore.js';

/**
 * Saver skill: compares this month's actual savings to the user's goal,
 * then proposes either a top-up payment (to hit the goal) or congratulates
 * if they've already cleared it.
 *
 * The top-up uses tools.pay.simulate() — a human-in-the-loop gate. The runtime
 * will pause here until the user clicks Approve or Reject in the modal.
 */

export const saver = {
  id: 'saver',
  label: 'Savings coach',
  description: 'Compares actual savings to your goal and offers to top up.',

  async *run({ tools, emit, sleep }) {
    const { profile } = getFinance();

    if (!profile.savingsGoal || profile.savingsGoal <= 0) {
      yield emit({
        type: 'finding',
        severity: 'info',
        title: 'No savings goal set',
        body: 'Open Settings → Profile to set a monthly target. I\'ll coach you against it next time.',
      });
      return { skipped: true };
    }

    yield emit({ type: 'thought', text: 'Checking savings progress for the month…' });
    await sleep(220);

    const txs = tools.ledger.list();
    const goal = savingsProgress(txs, profile.savingsGoal);
    const monthTx = inMonth(txs);
    const t = totals(monthTx);

    yield emit({
      type: 'thought',
      text: `Goal $${goal.goal}. Saved so far: $${Math.round(goal.saved)} (${Math.round(goal.pct * 100)}%).`,
    });
    await sleep(260);

    if (goal.pct >= 1) {
      yield emit({
        type: 'finding',
        severity: 'good',
        title: `Savings goal hit — $${Math.round(goal.saved)} saved`,
        body: 'You cleared the target with room to spare. Consider bumping the goal next month.',
      });
      return { hit: true };
    }

    const gap = Math.round(goal.goal - goal.saved);
    const room = Math.max(0, Math.round(t.net));   // headroom this month

    if (room < gap) {
      yield emit({
        type: 'finding',
        severity: 'warn',
        title: `Short by $${gap}, but only $${room} of headroom this month`,
        body: 'Bumping the goal would put you in the red. Hold this month, trim one category next month.',
      });
      return { gap, room, paymentBlocked: true };
    }

    yield emit({
      type: 'thought',
      text: `Room to top up: $${gap} fits inside $${room} of monthly net. Requesting approval…`,
    });
    await sleep(200);

    yield emit({
      type: 'tool:call',
      tool: 'pay',
      action: 'simulate',
      args: { payee: 'Savings account', amount: gap },
      result: 'awaiting human approval',
    });

    const result = await tools.pay.simulate({
      payee: 'Savings account',
      amount: gap,
      category: 'savings',
      reason: `Top-up to hit $${goal.goal} goal`,
    });

    if (result.approved) {
      yield emit({
        type: 'finding',
        severity: 'good',
        title: `Approved — $${gap} moved to savings`,
        body: 'Goal is now hit for the month. Nice.',
      });
      tools.notify.toast('Savings top-up complete', 'ok');
    } else {
      yield emit({
        type: 'finding',
        severity: 'info',
        title: 'Top-up rejected',
        body: 'No worries. We\'ll revisit next time you run the agent.',
      });
    }

    return { gap, ...result };
  },
};
