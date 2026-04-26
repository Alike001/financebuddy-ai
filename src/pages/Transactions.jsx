import { useMemo, useState } from 'react';
import { useFinanceStore, actions } from '../store/useFinanceStore.js';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories.js';
import { money, dateShort } from '../utils/format.js';
import TransactionForm from '../components/TransactionForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

/**
 * Transactions ledger with full CRUD.
 *
 * UI shape:
 *   [ search ] [ category filter ] [ + Add ]
 *   list of rows (newest first), each with edit + delete buttons.
 *
 * Filtering happens in-memory — fast enough for thousands of rows and keeps
 * the store dumb. Add/edit go through the same modal form.
 */
export default function Transactions() {
  const { transactions, profile } = useFinanceStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');     // 'all' | category id
  const [editing, setEditing] = useState(null);    // transaction object | null
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false;
      if (!q) return true;
      return (
        t.description.toLowerCase().includes(q) ||
        (CATEGORY_BY_ID[t.category]?.label.toLowerCase().includes(q) ?? false)
      );
    });
  }, [transactions, query, filter]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income + expense, count: filtered.length };
  }, [filtered]);

  function handleSave(data) {
    if (editing) {
      actions.updateTransaction(editing.id, data);
      setEditing(null);
    } else {
      actions.addTransaction(data);
      setAdding(false);
    }
  }

  function confirmDelete() {
    if (pendingDelete) {
      actions.deleteTransaction(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  return (
    <section className="page">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--s-4)' }}>
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-sub">
            {totals.count} {totals.count === 1 ? 'entry' : 'entries'} ·
            {' '}<span style={{ color: 'var(--c-positive)' }}>{money(totals.income, profile.currency)}</span> in,
            {' '}<span style={{ color: 'var(--c-text-mute)' }}>{money(totals.expense, profile.currency)}</span> out
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add transaction</button>
      </div>

      <div className="tx-toolbar">
        <input
          className="input"
          placeholder="Search description or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chip-row">
          <button
            className={'chip ' + (filter === 'all' ? 'on' : '')}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={'chip ' + (filter === c.id ? 'on' : '')}
              onClick={() => setFilter(c.id)}
              style={filter === c.id ? { borderColor: c.color, color: c.color } : undefined}
            >
              <span style={{ color: c.color }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="placeholder-card" style={{ border: 'none' }}>
            {transactions.length === 0
              ? 'No transactions yet. Click + Add transaction to log your first one.'
              : 'No transactions match this search or filter.'}
          </div>
        ) : (
          <ul className="tx-list">
            {filtered.map((t) => {
              const cat = CATEGORY_BY_ID[t.category] ?? CATEGORY_BY_ID.other;
              return (
                <li key={t.id} className="tx-row tx-row-actions">
                  <span className="tx-icon" style={{ color: cat.color }}>{cat.icon}</span>
                  <span className="tx-desc">
                    <span className="tx-title">{t.description}</span>
                    <span className="tx-meta">
                      {cat.label} · {dateShort(t.date)}
                      {t.simulated && <span className="pill pill-info" style={{ marginLeft: 8 }}>simulated</span>}
                    </span>
                  </span>
                  <span className={'tx-amt ' + (t.amount >= 0 ? 'pos' : 'neg')}>
                    {money(t.amount, profile.currency)}
                  </span>
                  <span className="tx-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(t)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(t)}>Delete</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(adding || editing) && (
        <TransactionForm
          transaction={editing}
          onSave={handleSave}
          onCancel={() => { setAdding(false); setEditing(null); }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this transaction?"
          message={`"${pendingDelete.description}" (${money(pendingDelete.amount, profile.currency)}) will be removed from the ledger.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
