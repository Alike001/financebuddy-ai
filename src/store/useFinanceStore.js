import { createStore } from './createStore.js';
import { load, save, clearAll } from './storage.js';
import { uid } from '../utils/id.js';
import { seedTransactions } from '../data/seedTransactions.js';

const STORAGE_KEY = 'state.v1';

const DEFAULT_STATE = {
  profile: {
    name: '',
    monthlyIncome: 0,
    currency: 'USD',
    savingsGoal: 0,
    onboarded: false,
  },
  transactions: [],   // { id, date, amount, category, description, simulated? }
  settings: {
    theme: 'dark',                                   // 'dark' | 'light'
    enabledSkills: ['categorize', 'insights', 'saver', 'report'],
    liveAi: { enabled: false, apiKey: '' },          // optional Anthropic mode (Step 14)
  },
};

function init() {
  const persisted = load(STORAGE_KEY);
  if (persisted && persisted.profile) return persisted;

  // First launch: ship a polished demo so the dashboard isn't empty.
  return {
    ...DEFAULT_STATE,
    profile: {
      name: 'Demo',
      monthlyIncome: 5000,
      currency: 'USD',
      savingsGoal: 800,
      onboarded: false,
    },
    transactions: seedTransactions(),
  };
}

const store = createStore(init());

// Persist on every change.
store.subscribe(() => save(STORAGE_KEY, store.getState()));

// React hook + raw getter for non-component code (e.g. agent runtime).
export const useFinanceStore = store.useStore;
export const getFinance = store.getState;

// Action functions — pure mutations expressed as updaters.
export const actions = {
  setProfile(patch) {
    store.setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },

  completeOnboarding(profile) {
    store.setState((s) => ({
      ...s,
      profile: { ...s.profile, ...profile, onboarded: true },
    }));
  },

  addTransaction(tx) {
    const id = tx.id ?? uid();
    store.setState((s) => ({
      ...s,
      transactions: [{ id, ...tx }, ...s.transactions],
    }));
    return id;
  },

  updateTransaction(id, patch) {
    store.setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    }));
  },

  deleteTransaction(id) {
    store.setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  },

  setTheme(theme) {
    store.setState((s) => ({ ...s, settings: { ...s.settings, theme } }));
  },

  toggleSkill(skillId) {
    store.setState((s) => {
      const list = s.settings.enabledSkills;
      const next = list.includes(skillId)
        ? list.filter((x) => x !== skillId)
        : [...list, skillId];
      return { ...s, settings: { ...s.settings, enabledSkills: next } };
    });
  },

  setLiveAi(patch) {
    store.setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        liveAi: { ...s.settings.liveAi, ...patch },
      },
    }));
  },

  resetAll() {
    clearAll();
    store.setState({ ...DEFAULT_STATE });
  },

  loadDemo() {
    store.setState({
      ...DEFAULT_STATE,
      profile: {
        name: 'Demo',
        monthlyIncome: 5000,
        currency: 'USD',
        savingsGoal: 800,
        onboarded: true,
      },
      transactions: seedTransactions(),
    });
  },
};
