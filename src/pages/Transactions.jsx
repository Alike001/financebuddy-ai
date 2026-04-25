import { useFinanceStore } from '../store/useFinanceStore.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { money, dateShort } from '../utils/format.js';

export default function Transactions() {
  const { transactions, profile } = useFinanceStore();

  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">Transactions</h2>
        <p className="page-sub">
          Read-only preview using seed data. Add/edit/delete arrives in step 5.
        </p>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <ul className="tx-list">
          {transactions.slice(0, 20).map((t) => {
            const cat = CATEGORY_BY_ID[t.category] ?? CATEGORY_BY_ID.other;
            return (
              <li key={t.id} className="tx-row">
                <span className="tx-icon" style={{ color: cat.color }}>{cat.icon}</span>
                <span className="tx-desc">
                  <span className="tx-title">{t.description}</span>
                  <span className="tx-meta">{cat.label} · {dateShort(t.date)}</span>
                </span>
                <span className={'tx-amt ' + (t.amount >= 0 ? 'pos' : 'neg')}>
                  {money(t.amount, profile.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
