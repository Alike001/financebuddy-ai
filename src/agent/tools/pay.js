/**
 * The pay tool simulates a payment.
 *
 * Important: it does NOT touch the ledger directly. It pushes a pending payment
 * onto the agent store, the UI catches that and renders an approval modal, and
 * only after the user approves does the transaction land. This is the
 * human-in-the-loop gate the workspace TOOLS.md file calls out.
 *
 * The actual approval logic lives in src/agent/payment.js so the tool stays
 * narrow — request only.
 */

import { agentActions } from '../../store/useAgentStore.js';
import { uid } from '../../utils/id.js';
import { today } from '../../utils/date.js';

export const pay = {
  /**
   * Request a payment. Returns the pending payment id.
   * The promise resolves when the user approves OR rejects, with `{ approved, txId? }`.
   */
  simulate({ payee, amount, category = 'other', reason = '' }) {
    const id = uid();
    return new Promise((resolve) => {
      agentActions.setPendingPayment({
        id,
        payee,
        amount: -Math.abs(amount),     // payments are expenses
        category,
        reason,
        date: today(),
        resolve,                         // runtime awaits this
      });
    });
  },
};
