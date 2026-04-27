import { NavLink } from 'react-router-dom';

import { useAgentStore } from '../store/useAgentStore.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/transactions', label: 'Transactions', icon: '≡' },
  { to: '/agent', label: 'Agent Workflow', icon: '✦' },
  { to: '/skills', label: 'Skills', icon: '◇' },
  { to: '/reports', label: 'Reports', icon: '▦' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const { status, pendingPayment } = useAgentStore();
  const agentBusy = status === 'running' || !!pendingPayment;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">FB</div>
        <div className="brand-text">
          <div className="brand-name">FinanceBuddy AI</div>
          <div className="brand-sub">local-first agent</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' nav-link-active' : '')
            }
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.to === '/agent' && agentBusy && (
              <span className="nav-pulse" aria-label="agent active" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="badge">OpenClaw-style</div>
        <div className="foot-text">Skills · Tools · Workspace</div>
      </div>
    </aside>
  );
}
