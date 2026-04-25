import { useSyncExternalStore } from 'react';

/**
 * Tiny store factory.
 * Holds a single state value, lets components subscribe via useSyncExternalStore,
 * and exposes setState + getState for action functions defined elsewhere.
 *
 * Why not Redux/Zustand? For this hackathon project, keeping state management
 * to ~25 readable lines is a feature: judges (and you) can see exactly how data flows.
 */
export function createStore(initial) {
  let state = initial;
  const listeners = new Set();

  const getState = () => state;

  const setState = (updater) => {
    const next = typeof updater === 'function' ? updater(state) : updater;
    if (Object.is(next, state)) return;
    state = next;
    listeners.forEach((l) => l());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = () => useSyncExternalStore(subscribe, getState, getState);

  return { getState, setState, subscribe, useStore };
}
