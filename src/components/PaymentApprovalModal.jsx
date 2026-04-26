/**
 * Global payment-approval modal.
 *
 * Mounted once in Layout. Renders only when the agent store has a
 * `pendingPayment` — i.e. some skill (or the manual simulator) called
 * tools.pay.simulate(...) and is awaiting the user's verdict.
 *
 * Approve / Reject resolve the in-flight Promise and let the awaiting skill
 * keep running. The runtime is literally paused on `await tools.pay.simulate`.
 */

import { useAgentStore } from '../store/useAgentStore.js';
import { useFinanceStore } from '../store/useFinanceStore.js';
import { approvePayment, rejectPayment } from '../agent/payment.js';
import { money, dateShort } from '../utils/format.js';
import { CATEGORY_BY_ID } from '../data/categories.js';

export default function PaymentApprovalModal() {
  const { pendingPayment } = useAgentStore();
  const { profile } = useFinanceStore();

  if (!pendingPayment) return null;

  const cat = CATEGORY_BY_ID[pendingPayment.category];

  return (
    <div className="modal-backdrop" onClick={rejectPayment}>
      <div
        className="modal pay-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pay-modal-title"
      >
        <div className="pay-modal-banner">
          <span className="pill pill-warn">
            <span className="live-dot" /> Agent paused — awaiting approval
          </span>
        </div>

        <h3 className="modal-title" id="pay-modal-title">{pendingPayment.payee}</h3>
        <p className="modal-sub">
          {pendingPayment.reason || 'The agent has prepared this payment for you to review.'}
        </p>

        <div className="pay-modal-amount">{money(pendingPayment.amount, profile.currency)}</div>

        <div className="pay-modal-meta">
          <div className="pay-modal-row">
            <span className="pay-modal-label">Date</span>
            <span className="pay-modal-value">{dateShort(pendingPayment.date)}</span>
          </div>
          <div className="pay-modal-row">
            <span className="pay-modal-label">Category</span>
            <span className="pay-modal-value">
              <span
                className="cat-dot"
                style={{ background: cat?.color || 'var(--c-text-dim)' }}
              />
              {cat?.label || pendingPayment.category}
            </span>
          </div>
          <div className="pay-modal-row">
            <span className="pay-modal-label">Mode</span>
            <span className="pay-modal-value">
              <code className="tl-code">simulated: true</code>
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={rejectPayment}>Reject</button>
          <button className="btn btn-primary" onClick={approvePayment}>Approve & pay</button>
        </div>

        <p className="pay-modal-foot">
          Demo-safe. The ledger row is tagged <code>simulated: true</code> so it never gets confused with real money movement.
        </p>
      </div>
    </div>
  );
}
