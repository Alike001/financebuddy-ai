/**
 * Pure selectors that turn the transactions array into the shapes charts and
 * cards want to render. Kept in one place so the dashboard, reports page, and
 * (later) the agent's `insights` skill can share the same arithmetic.
 *
 * Convention: expenses are negative numbers in the store. We always return
 * absolute values for "spent" amounts so charts don't draw downward bars.
 */

import { CATEGORIES } from '../data/categories.js';
import { monthOf, today, daysAgo } from './date.js';

export function inRange(transactions, fromIso, toIso) {
  return transactions.filter((t) => t.date >= fromIso && t.date <= toIso);
}

export function inMonth(transactions, ym = monthOf(today())) {
  return transactions.filter((t) => monthOf(t.date) === ym);
}

export function totals(transactions) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.amount >= 0) income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income + expense };
}

/**
 * Spend per expense category (absolute values), sorted desc.
 * Returns [{ id, label, color, value, pct }]. `pct` is share of total expense.
 */
export function spendByCategory(transactions) {
  const expenses = transactions.filter((t) => t.amount < 0);
  const totalExpense = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);

  const sums = new Map();
  for (const t of expenses) {
    sums.set(t.category, (sums.get(t.category) || 0) + Math.abs(t.amount));
  }

  return CATEGORIES
    .filter((c) => c.id !== 'income' && sums.has(c.id))
    .map((c) => {
      const value = sums.get(c.id);
      return {
        id: c.id,
        label: c.label,
        color: c.color,
        value,
        pct: totalExpense > 0 ? value / totalExpense : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Daily spend series for the last `days` days (oldest → newest), so a bar
 * chart reads left-to-right like a calendar.
 */
export function dailySpend(transactions, days = 30) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const iso = daysAgo(i);
    buckets.set(iso, 0);
  }
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    if (buckets.has(t.date)) {
      buckets.set(t.date, buckets.get(t.date) + Math.abs(t.amount));
    }
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    short: date.slice(5),    // "MM-DD"
    value,
  }));
}

export function topExpenses(transactions, n = 5) {
  return [...transactions]
    .filter((t) => t.amount < 0)
    .sort((a, b) => a.amount - b.amount)   // most negative first
    .slice(0, n);
}

/**
 * Goal progress = how much we've saved this month vs. profile.savingsGoal.
 * "Saved" = explicit transfers to the savings category this month.
 */
export function savingsProgress(transactions, goal) {
  const month = inMonth(transactions);
  const saved = month
    .filter((t) => t.category === 'savings')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const pct = goal > 0 ? Math.min(saved / goal, 1) : 0;
  return { saved, goal, pct };
}
