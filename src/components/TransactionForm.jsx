import { useMemo, useState } from 'react';
import { CATEGORIES } from '../data/categories.js';
import { autoCategorize } from '../utils/categorize.js';
import { today } from '../utils/date.js';

/**
 * Modal form for adding or editing a transaction.
 *
 * Mode is implicit: pass `transaction` to edit, omit it to add.
 * Auto-categorization is derived from inputs each render (no effect, no
 * cascading setState). Once the user picks a category, we stop guessing so we
 * don't fight them.
 *
 * Amount UX: the user types a positive number and picks "Expense" or "Income".
 * We store expenses as negative internally (matches the seed data convention).
 */
export default function TransactionForm({ transaction, onSave, onCancel }) {
  const editing = Boolean(transaction);

  const [form, setForm] = useState(() => initialForm(transaction));
  const [userCategory, setUserCategory] = useState(transaction ? transaction.category : null);

  const signedAmount = form.kind === 'income'
    ? Math.abs(Number(form.amount) || 0)
    : -Math.abs(Number(form.amount) || 0);

  const autoGuess = useMemo(
    () => autoCategorize(form.description, signedAmount),
    [form.description, signedAmount],
  );

  const category = userCategory ?? autoGuess;
  const isAuto = userCategory === null;

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function handleCategory(e) {
    setUserCategory(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const raw = Number(form.amount);
    if (!form.description.trim() || !raw || Number.isNaN(raw)) return;

    const signed = form.kind === 'income' ? Math.abs(raw) : -Math.abs(raw);
    onSave({
      date: form.date || today(),
      amount: signed,
      category,
      description: form.description.trim(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="modal-title">{editing ? 'Edit transaction' : 'Add transaction'}</h3>
        <p className="modal-sub">
          {editing
            ? 'Tweak any field. Saving updates the ledger immediately.'
            : 'Type a description and amount — the agent will guess a category for you.'}
        </p>

        <div className="form-grid">
          <div className="form-row" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Description</label>
            <input
              className="input"
              autoFocus
              placeholder="e.g. Whole Foods, Friday drinks, Paycheck"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label className="label">Type</label>
            <div className="seg">
              <button
                type="button"
                className={'seg-btn ' + (form.kind === 'expense' ? 'on' : '')}
                onClick={() => update({ kind: 'expense' })}
              >
                Expense
              </button>
              <button
                type="button"
                className={'seg-btn ' + (form.kind === 'income' ? 'on' : '')}
                onClick={() => update({ kind: 'income' })}
              >
                Income
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="label">Amount</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => update({ amount: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label className="label">
              Category
              {isAuto && form.description && (
                <span className="label-hint"> · auto-guessed</span>
              )}
            </label>
            <select className="select" value={category} onChange={handleCategory}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon}  {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

function initialForm(tx) {
  if (!tx) {
    return {
      description: '',
      amount: '',
      kind: 'expense',
      date: today(),
    };
  }
  return {
    description: tx.description ?? '',
    amount: String(Math.abs(tx.amount ?? 0)),
    kind: (tx.amount ?? 0) >= 0 ? 'income' : 'expense',
    date: tx.date ?? today(),
  };
}
