import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import AgentWorkflow from './pages/AgentWorkflow.jsx';
import Skills from './pages/Skills.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Onboarding from './pages/Onboarding.jsx';
import { useFinanceStore } from './store/useFinanceStore.js';

export default function App() {
  const { profile, settings } = useFinanceStore();

  // Sync theme to <html data-theme="..."> so CSS variables in variables.css swap.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        element={
          profile.onboarded ? <Layout /> : <Navigate to="/onboarding" replace />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/agent" element={<AgentWorkflow />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
