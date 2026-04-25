/**
 * Category metadata is the single source of truth for icons + colors.
 * Charts read `color` directly so swapping a color updates everywhere.
 *
 * Glyphs (not emoji) keep the visual language consistent and demo-friendly.
 */

export const CATEGORIES = [
  { id: 'food',      label: 'Food & dining',     icon: '◍', color: 'var(--cat-food)' },
  { id: 'rent',      label: 'Rent & housing',    icon: '⌂', color: 'var(--cat-rent)' },
  { id: 'bills',     label: 'Bills & utilities', icon: '⚡', color: 'var(--cat-bills)' },
  { id: 'transport', label: 'Transport',         icon: '↦', color: 'var(--cat-transport)' },
  { id: 'shopping',  label: 'Shopping',          icon: '◇', color: 'var(--cat-shopping)' },
  { id: 'fun',       label: 'Fun & leisure',     icon: '★', color: 'var(--cat-fun)' },
  { id: 'savings',   label: 'Savings',           icon: '▲', color: 'var(--cat-savings)' },
  { id: 'other',     label: 'Other',             icon: '∘', color: 'var(--cat-other)' },
  { id: 'income',    label: 'Income',            icon: '↑', color: 'var(--cat-income)' },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'income');
