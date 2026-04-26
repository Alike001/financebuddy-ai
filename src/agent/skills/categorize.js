import { autoCategorize } from '../../utils/categorize.js';
import { CATEGORY_BY_ID } from '../../data/categories.js';

/**
 * Categorize skill: scan transactions tagged "other" and try to assign a
 * better category from the keyword heuristic. The skill emits a `tool:call`
 * for each update so the workflow timeline shows real ledger writes.
 */

export const categorize = {
  id: 'categorize',
  label: 'Auto-categorizer',
  description: 'Tags any transaction stuck in "Other" with a smarter category.',

  async *run({ tools, emit, sleep }) {
    yield emit({ type: 'thought', text: 'Scanning the ledger for transactions still tagged Other…' });
    await sleep(300);

    const targets = tools.ledger.uncategorized();
    yield emit({
      type: 'thought',
      text: `Found ${targets.length} ${targets.length === 1 ? 'row' : 'rows'} to review.`,
    });

    let updates = 0;
    for (const t of targets) {
      const guess = autoCategorize(t.description, t.amount);
      if (guess !== 'other') {
        await sleep(120);
        tools.ledger.update(t.id, { category: guess });
        updates += 1;
        const cat = CATEGORY_BY_ID[guess];
        yield emit({
          type: 'tool:call',
          tool: 'ledger',
          action: 'update',
          args: { id: t.id, category: guess },
          result: `${t.description} → ${cat?.label ?? guess}`,
        });
      }
    }

    if (updates > 0) {
      yield emit({
        type: 'finding',
        severity: 'good',
        title: `${updates} ${updates === 1 ? 'transaction' : 'transactions'} re-categorized`,
        body: 'Your category breakdowns will be sharper now.',
      });
    } else {
      yield emit({
        type: 'finding',
        severity: 'info',
        title: 'Nothing to re-categorize',
        body: 'All transactions already have a non-default category. Nice ledger hygiene.',
      });
    }

    return { updates, scanned: targets.length };
  },
};
