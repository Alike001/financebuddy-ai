import { useState } from 'react';

import { useFinanceStore, actions } from '../store/useFinanceStore.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

const SKILLS_META = [
  { id: 'categorize', label: 'Categorize', desc: 'Auto-tag transactions by merchant + keywords.' },
  { id: 'insights',   label: 'Insights',   desc: 'Detects subscription bloat, weekend overspend, category drift.' },
  { id: 'saver',      label: 'Saver',      desc: 'Compares spend vs. goal and recommends adjustments.' },
  { id: 'report',     label: 'Report',     desc: 'Writes the monthly report on the Reports page.' },
];

export default function Settings() {
  const { profile, settings, transactions } = useFinanceStore();
  const [name, setName] = useState(profile.name);
  const [income, setIncome] = useState(profile.monthlyIncome);
  const [currency, setCurrency] = useState(profile.currency);
  const [goal, setGoal] = useState(profile.savingsGoal);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveProfile = () => {
    actions.setProfile({
      name: name.trim() || profile.name,
      monthlyIncome: Number(income) || 0,
      savingsGoal: Number(goal) || 0,
      currency,
    });
  };

  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">Settings</h2>
        <p className="page-sub">Profile, theme, skills, data — all stored in this browser only.</p>
      </div>

      <div className="grid grid-2 settings-grid">
        {/* Profile */}
        <section className="card">
          <h3 className="settings-heading">Profile</h3>
          <p className="settings-hint">Used everywhere the agent talks to you.</p>

          <label className="label" htmlFor="s-name">Name</label>
          <input id="s-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="grid grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="label" htmlFor="s-income">Monthly income</label>
              <input id="s-income" type="number" className="input" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="s-currency">Currency</label>
              <select id="s-currency" className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label className="label" htmlFor="s-goal" style={{ marginTop: 12 }}>Monthly savings goal</label>
          <input id="s-goal" type="number" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} />

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveProfile}>Save profile</button>
          </div>
        </section>

        {/* Appearance */}
        <section className="card">
          <h3 className="settings-heading">Appearance</h3>
          <p className="settings-hint">Theme is applied instantly across the whole app.</p>
          <div className="theme-row">
            {['dark', 'light'].map((t) => (
              <button
                key={t}
                className={'theme-card' + (settings.theme === t ? ' on' : '')}
                onClick={() => actions.setTheme(t)}
              >
                <span className={'theme-swatch theme-' + t} />
                <span>{t === 'dark' ? 'Dark (default)' : 'Light'}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="settings-heading">Agent skills</h3>
          <p className="settings-hint">
            Mirrors the OpenClaw skill model. Toggle a skill off and the agent runtime will skip it
            in every workflow.
          </p>
          <div className="grid grid-2">
            {SKILLS_META.map((s) => {
              const on = settings.enabledSkills.includes(s.id);
              return (
                <div key={s.id} className={'skill-row' + (on ? ' on' : '')}>
                  <div>
                    <div className="skill-row-title">{s.label}</div>
                    <div className="skill-row-desc">{s.desc}</div>
                  </div>
                  <button
                    className={'switch' + (on ? ' on' : '')}
                    aria-pressed={on}
                    onClick={() => actions.toggleSkill(s.id)}
                  >
                    <span className="switch-knob" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live AI mode (placeholder) */}
        <section className="card">
          <h3 className="settings-heading">
            Live AI mode <span className="pill pill-info" style={{ marginLeft: 8 }}>step 14</span>
          </h3>
          <p className="settings-hint">
            Optional. Paste your Anthropic API key to upgrade the agent's narration to real Claude.
            Default agent is fully deterministic and demo-safe — you don't need this.
          </p>
          <label className="label" htmlFor="s-key">Anthropic API key</label>
          <input
            id="s-key"
            className="input"
            type="password"
            placeholder="sk-ant-..."
            value={settings.liveAi.apiKey}
            onChange={(e) => actions.setLiveAi({ apiKey: e.target.value })}
            disabled
          />
          <div className="settings-hint" style={{ marginTop: 8 }}>
            This input is wired but inert until step 14. Key never leaves your browser when active.
          </div>
        </section>

        {/* Data */}
        <section className="card">
          <h3 className="settings-heading">Data</h3>
          <p className="settings-hint">
            {transactions.length} transactions stored in localStorage. Nothing leaves this device.
          </p>
          <div className="modal-actions" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => actions.loadDemo()}>Reload demo data</button>
            <button
              className={'btn ' + (confirmReset ? 'btn-danger' : 'btn-ghost')}
              onClick={() => {
                if (confirmReset) {
                  actions.resetAll();
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                  setTimeout(() => setConfirmReset(false), 4000);
                }
              }}
            >
              {confirmReset ? 'Click again to confirm' : 'Erase all data'}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
