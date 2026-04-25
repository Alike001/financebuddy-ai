import { createStore } from './createStore.js';
import { uid } from '../utils/id.js';

/**
 * The agent store is intentionally NOT persisted.
 * Each run is a fresh transcript, in-memory only — same shape as OpenClaw
 * session JSONL but lighter (we don't need to replay across reloads).
 */
const initial = {
  status: 'idle',          // 'idle' | 'running' | 'done' | 'error'
  goalId: null,
  goalLabel: '',
  events: [],              // { id, ts, type, ...payload }
  summary: null,           // string written at end of run
  pendingPayment: null,    // human-in-the-loop approval gate
  toasts: [],              // { id, message, kind }
};

const store = createStore(initial);

export const useAgentStore = store.useStore;
export const getAgent = store.getState;

export const agentActions = {
  startRun({ goalId, goalLabel }) {
    store.setState({
      ...initial,
      status: 'running',
      goalId,
      goalLabel,
      events: [],
    });
  },

  emit(event) {
    const e = { id: uid(), ts: Date.now(), ...event };
    store.setState((s) => ({ ...s, events: [...s.events, e] }));
  },

  finish(summary) {
    store.setState((s) => ({ ...s, status: 'done', summary }));
  },

  fail(message) {
    store.setState((s) => ({ ...s, status: 'error', summary: message }));
  },

  setPendingPayment(payment) {
    store.setState((s) => ({ ...s, pendingPayment: payment }));
  },

  clearPendingPayment() {
    store.setState((s) => ({ ...s, pendingPayment: null }));
  },

  pushToast(message, kind = 'info') {
    const id = uid();
    store.setState((s) => ({
      ...s,
      toasts: [...s.toasts, { id, message, kind }],
    }));
    setTimeout(() => agentActions.dismissToast(id), 4000);
  },

  dismissToast(id) {
    store.setState((s) => ({
      ...s,
      toasts: s.toasts.filter((t) => t.id !== id),
    }));
  },

  reset() {
    store.setState(initial);
  },
};
