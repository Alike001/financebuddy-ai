import { useLocation } from 'react-router-dom';

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
  const title = TITLES[pathname] ?? 'FinanceBuddy AI';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <span className="topbar-sub">Your local-first finance agent</span>
      </div>
      <div className="topbar-right">
        <span className="pill pill-ok">● agent ready</span>
      </div>
    </header>
  );
}
