/**
 * The ledger tool is the agent's read/write interface to transactions.
 * It's a thin facade over the finance store — narrowing the surface area is
 * the whole point. A skill can list, filter, and update; it cannot drop the
 * table or invent new schemas.
 */

import { getFinance, actions } from '../../store/useFinanceStore.js';
import { inMonth, inRange } from '../../utils/analytics.js';
import { monthOf, today } from '../../utils/date.js';

export const ledger = {
  list() {
    return getFinance().transactions;
  },

  byMonth(ym = monthOf(today())) {
    return inMonth(getFinance().transactions, ym);
  },

  byRange(fromIso, toIso) {
    return inRange(getFinance().transactions, fromIso, toIso);
  },

  byCategory(catId) {
    return getFinance().transactions.filter((t) => t.category === catId);
  },

  uncategorized() {
    return getFinance().transactions.filter((t) => t.category === 'other');
  },

  update(id, patch) {
    actions.updateTransaction(id, patch);
  },
};
