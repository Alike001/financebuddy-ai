/**
 * Lightweight keyword-based auto-categorization.
 *
 * This is the deterministic baseline used by the Transactions form so a user
 * can type "Whole Foods" and see it tagged as Food without thinking. In Step 7
 * the same logic gets promoted into the `categorize` agent skill, where it can
 * be augmented by the live LLM (Step 14) for ambiguous descriptions.
 *
 * Rule: positive amount → income. Otherwise: first matching keyword wins, then
 * fall back to "other".
 */

const RULES = [
  { id: 'food',      keywords: ['grocery', 'groceries', 'whole foods', 'trader', 'costco', 'safeway', 'kroger', 'aldi', 'restaurant', 'cafe', 'coffee', 'starbucks', 'chipotle', 'mcdonald', 'pizza', 'sushi', 'brunch', 'lunch', 'dinner', 'doordash', 'ubereats', 'eats'] },
  { id: 'rent',      keywords: ['rent', 'landlord', 'mortgage', 'lease', 'apartment'] },
  { id: 'bills',     keywords: ['electric', 'water', 'gas bill', 'internet', 'phone', 'verizon', 'at&t', 'comcast', 'utility', 'utilities', 'netflix', 'spotify', 'icloud', 'youtube', 'subscription', 'insurance'] },
  { id: 'transport', keywords: ['uber', 'lyft', 'taxi', 'metro', 'subway', 'bus', 'train', 'gasoline', 'fuel', 'shell', 'chevron', 'parking', 'toll', 'flight', 'airline'] },
  { id: 'shopping',  keywords: ['amazon', 'target', 'walmart', 'best buy', 'apple store', 'nike', 'zara', 'h&m', 'ikea', 'clothing', 'shoes', 'electronics', 'gadget'] },
  { id: 'fun',       keywords: ['cinema', 'movie', 'theater', 'concert', 'bar', 'pub', 'drinks', 'club', 'game', 'steam', 'playstation', 'xbox', 'gym', 'travel', 'hotel', 'airbnb'] },
  { id: 'savings',   keywords: ['savings', 'transfer to savings', 'investment', 'roth', '401k', 'vanguard', 'fidelity'] },
];

export function autoCategorize(description, amount) {
  if (typeof amount === 'number' && amount > 0) return 'income';
  const text = String(description || '').toLowerCase().trim();
  if (!text) return 'other';

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) return rule.id;
  }
  return 'other';
}
