import { getFinance } from '../../store/useFinanceStore.js';
import { monthOf, today } from '../../utils/date.js';
import { composeMonthlyReport } from '../../utils/report.js';

/**
 * Report skill: a single-paragraph human-readable monthly summary, written in
 * the SOUL.md voice (friendly buddy, headline-first). Delegates to the shared
 * `composeMonthlyReport` helper so the Reports page renders the same words.
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
    const composed = composeMonthlyReport(tools.ledger.list(), profile, ym);

    yield emit({
      type: 'finding',
      severity: 'info',
      title: `${composed.monthName} report`,
      body: composed.body,
    });

    return composed;
  },
};
