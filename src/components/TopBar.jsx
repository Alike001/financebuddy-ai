import { useLocation } from 'react-router-dom';

import { useAgentStore } from '../store/useAgentStore.js';

const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/agent': 'Agent Workflow',
  '/skills': 'Skills',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { status, pendingPayment } = useAgentStore();
  const title = TITLES[pathname] ?? 'FinanceBuddy AI';

  const agent = pillFor(status, pendingPayment);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <span className="topbar-sub">Your local-first finance agent</span>
      </div>
      <div className="topbar-right">
        <span className={agent.className}>
          {agent.dot && <span className="live-dot" />}
          {agent.label}
        </span>
      </div>
    </header>
  );
}

function pillFor(status, pendingPayment) {
  if (pendingPayment) return { className: 'pill pill-warn', label: 'approval needed', dot: true };
  if (status === 'running') return { className: 'pill pill-info', label: 'agent running', dot: true };
  if (status === 'error')   return { className: 'pill pill-warn', label: 'agent error',   dot: false };
  return { className: 'pill pill-ok', label: 'agent ready', dot: false };
}
