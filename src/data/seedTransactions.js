import { uid } from '../utils/id.js';
import { daysAgo } from '../utils/date.js';

/**
 * Hand-tuned demo transactions over the last ~60 days.
 *
 * Patterns are intentionally rich so the agent has real material to chew on:
 *   - biweekly paychecks (income)
 *   - rent on the 1st-ish
 *   - recurring subscriptions (Netflix, Spotify, iCloud) — insights skill flags these
 *   - weekly groceries
 *   - weekend brunches + Friday drinks (weekend overspend pattern)
 *   - savings transfers (saver skill compares against goal)
 *
 * Income amounts are positive; expenses are negative.
 */
export function seedTransactions() {
  const tx = [];
  const push = (d, amount, category, description) => {
    tx.push({ id: uid(), date: daysAgo(d), amount, category, description });
  };

  // Income (biweekly paycheck)
  push(58, 2500, 'income', 'Paycheck');
  push(44, 2500, 'income', 'Paycheck');
  push(30, 2500, 'income', 'Paycheck');
  push(16, 2500, 'income', 'Paycheck');
  push(2,  2500, 'income', 'Paycheck');

  // Rent
  push(55, -1450, 'rent', 'Rent · last month');
  push(25, -1450, 'rent', 'Rent · this month');

  // Recurring subscriptions
  push(50, -15.99, 'bills', 'Streaming · Netflix');
  push(20, -15.99, 'bills', 'Streaming · Netflix');
  push(48, -10.99, 'bills', 'Streaming · Spotify');
  push(18, -10.99, 'bills', 'Streaming · Spotify');
  push(44, -9.99,  'bills', 'iCloud storage');
  push(14, -9.99,  'bills', 'iCloud storage');

  // Utilities
  push(40, -76.20, 'bills', 'Electricity');
  push(10, -82.40, 'bills', 'Electricity');
  push(38, -45.00, 'bills', 'Internet');
  push(8,  -45.00, 'bills', 'Internet');

  // Groceries (weekly cadence)
  push(56, -88.30, 'food', 'Whole Foods');
  push(49, -64.10, 'food', 'Trader Joes');
  push(42, -71.55, 'food', 'Whole Foods');
  push(35, -55.20, 'food', 'Trader Joes');
  push(28, -92.40, 'food', 'Costco');
  push(21, -68.75, 'food', 'Whole Foods');
  push(14, -78.10, 'food', 'Trader Joes');
  push(7,  -64.30, 'food', 'Whole Foods');
  push(1,  -32.40, 'food', 'Corner store');

  // Transport
  push(53, -28.00, 'transport', 'Uber to airport');
  push(45, -2.75,  'transport', 'Subway');
  push(33, -42.00, 'transport', 'Gas · Shell');
  push(22, -2.75,  'transport', 'Subway');
  push(15, -38.00, 'transport', 'Gas · Shell');
  push(5,  -2.75,  'transport', 'Subway');

  // Fun & shopping — weekend-heavy on purpose
  push(54, -42.00, 'fun',      'Cinema · IMAX');
  push(46, -28.50, 'fun',      'Saturday brunch');
  push(46, -54.00, 'shopping', 'Amazon · misc');
  push(39, -120.00,'shopping', 'New shoes');
  push(32, -38.00, 'fun',      'Friday drinks');
  push(31, -26.50, 'fun',      'Saturday brunch');
  push(24, -85.00, 'shopping', 'Amazon · electronics');
  push(17, -32.40, 'fun',      'Concert tickets');
  push(11, -48.20, 'fun',      'Saturday dinner');
  push(10, -22.00, 'fun',      'Sunday brunch');
  push(4,  -65.00, 'shopping', 'Amazon · books');
  push(3,  -38.00, 'fun',      'Saturday brunch');

  // Savings transfers
  push(57, -200.00, 'savings', 'Transfer to savings');
  push(27, -200.00, 'savings', 'Transfer to savings');

  // Newest first
  return tx.sort((a, b) => (a.date < b.date ? 1 : -1));
}
