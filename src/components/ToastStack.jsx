/**
 * Global toast stack.
 *
 * Reads from the agent store (where notify.toast pushes) and renders a tiny
 * stack in the bottom-right. Each toast auto-dismisses after 4s via
 * agentActions.pushToast — we just need to render the list.
 */

import { useAgentStore, agentActions } from '../store/useAgentStore.js';

export default function ToastStack() {
  const { toasts } = useAgentStore();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <button
          key={t.id}
          className={`toast toast-${t.kind || 'info'}`}
          onClick={() => agentActions.dismissToast(t.id)}
          title="Dismiss"
        >
          <span className="toast-glyph">{glyphFor(t.kind)}</span>
          <span className="toast-msg">{t.message}</span>
        </button>
      ))}
    </div>
  );
}

function glyphFor(kind) {
  switch (kind) {
    case 'ok':   return '✓';
    case 'warn': return '⚠';
    case 'err':  return '⨯';
    default:     return '◉';
  }
}
