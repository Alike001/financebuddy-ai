/**
 * Tiny localStorage wrapper.
 * All keys are namespaced under "fb:" so we never collide with other apps
 * sharing the same origin during local development.
 */

const PREFIX = 'fb:';

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — ignore */
  }
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* noop */ }
}

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* noop */ }
}
