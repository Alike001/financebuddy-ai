/**
 * Skills page — the OpenClaw-style "marketplace".
 *
 * Three stacked sections, each one selling a piece of the OpenClaw mental model:
 *   1. Skills    → toggleable async-generator skills the runtime can plan with.
 *   2. Tools     → narrow facade the skills call into. Read-only here; the page
 *                  exists to prove "skills can't reach past the toolbox".
 *   3. Workspace → the markdown files the agent reads at the top of every run.
 *                  Click any one to see exactly what's in the agent's context.
 *
 * Toggling a skill flips its bit in settings.enabledSkills. The planner reads
 * that list, so a disabled skill silently drops out of any goal that included
 * it. We mirror this on the Agent Workflow page automatically.
 */

import { useState } from 'react';
import {
  useFinanceStore,
  actions as financeActions,
  getFinance,
} from '../store/useFinanceStore.js';
import { SKILL_LIST } from '../agent/skills/index.js';
import { tools } from '../agent/tools/index.js';
import { WORKSPACE, renderUserMd } from '../agent/workspace/index.js';
import { runGoal } from '../agent/runtime.js';
import { useAgentStore } from '../store/useAgentStore.js';

const SKILL_META = {
  categorize: { glyph: '⌗', goalId: 'categorize',     uses: ['ledger'] },
  insights:   { glyph: '⌖', goalId: 'find-risks',     uses: ['ledger'] },
  saver:      { glyph: '▲', goalId: 'savings-coach',  uses: ['ledger', 'pay', 'notify'] },
  report:     { glyph: '◳', goalId: 'write-report',   uses: ['ledger'] },
};

const TOOLS_META = [
  {
    id: 'ledger',
    glyph: '⎙',
    title: 'ledger',
    description: 'Read and write the transaction ledger. The single source of truth for every skill that needs money data.',
    methods: ['list', 'byMonth', 'byRange', 'byCategory', 'uncategorized', 'update'],
    note: 'No delete. No schema changes. Skills can read the world and patch a row — nothing more.',
  },
  {
    id: 'pay',
    glyph: '⇆',
    title: 'pay',
    description: 'Request a simulated payment. Returns a Promise that resolves only after the user approves or rejects.',
    methods: ['simulate'],
    note: 'Human-in-the-loop gate. The runtime literally awaits the modal.',
  },
  {
    id: 'notify',
    glyph: '⚐',
    title: 'notify',
    description: 'Push an in-app toast for events the user should glance at without opening the timeline.',
    methods: ['toast'],
    note: 'Side-channel UI nudge. Not used for primary findings.',
  },
];

const WORKSPACE_FILES = [
  { id: 'IDENTITY',  title: 'IDENTITY.md',  blurb: 'Who the agent is.',                    body: WORKSPACE.IDENTITY },
  { id: 'SOUL',      title: 'SOUL.md',      blurb: 'How it talks.',                         body: WORKSPACE.SOUL },
  { id: 'AGENTS',    title: 'AGENTS.md',    blurb: 'Operating rules and skill registry.',   body: WORKSPACE.AGENTS },
  { id: 'TOOLS',     title: 'TOOLS.md',     blurb: 'When to reach for which tool.',         body: WORKSPACE.TOOLS },
  { id: 'USER',      title: 'USER.md',      blurb: 'Live snapshot of the user — rendered each run.' /* body lazy */ },
];

export default function Skills() {
  const { settings } = useFinanceStore();
  const { status: agentStatus, pendingPayment } = useAgentStore();
  const enabled = new Set(settings.enabledSkills);
  const enabledCount = SKILL_LIST.filter((s) => enabled.has(s.id)).length;
  const blocked = agentStatus === 'running' || !!pendingPayment;

  const [openFile, setOpenFile] = useState(null);

  return (
    <section className="page">
      <div className="page-head workflow-head">
        <div>
          <h2 className="page-title">Skills</h2>
          <p className="page-sub">
            The agent's modular brain. Each skill is its own file, the planner picks an ordered subset for a goal, and the toolbox below is what they're allowed to touch.
          </p>
        </div>
        <span className="pill pill-info">{enabledCount} of {SKILL_LIST.length} enabled</span>
      </div>

      {/* Skills */}
      <div className="skills-section">
        <div className="section-head">
          <h3 className="section-title">Installed skills</h3>
          <span className="section-sub">drop-in async generators · toggle them on or off without touching code</span>
        </div>

        <div className="skills-grid">
          {SKILL_LIST.map((s) => {
            const meta = SKILL_META[s.id] || {};
            const isOn = enabled.has(s.id);
            return (
              <SkillCard
                key={s.id}
                skill={s}
                meta={meta}
                isOn={isOn}
                disabled={blocked}
                onToggle={() => financeActions.toggleSkill(s.id)}
                onRun={() => meta.goalId && runGoal(meta.goalId)}
              />
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="skills-section">
        <div className="section-head">
          <h3 className="section-title">Toolbox</h3>
          <span className="section-sub">narrow facade · the only API surface skills are allowed to call</span>
        </div>

        <div className="tools-grid">
          {TOOLS_META.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="skills-section">
        <div className="section-head">
          <h3 className="section-title">Workspace</h3>
          <span className="section-sub">markdown files the agent re-reads at the top of every run</span>
        </div>

        <div className="workspace-list">
          {WORKSPACE_FILES.map((f) => {
            const isOpen = openFile === f.id;
            const body = f.id === 'USER' ? renderUserMd(getFinance()) : f.body;
            return (
              <div key={f.id} className={`ws-row ${isOpen ? 'ws-row-open' : ''}`}>
                <button
                  className="ws-row-head"
                  onClick={() => setOpenFile(isOpen ? null : f.id)}
                >
                  <div className="ws-row-left">
                    <span className="ws-glyph">{isOpen ? '▾' : '▸'}</span>
                    <code className="ws-file">{f.title}</code>
                    <span className="ws-blurb">{f.blurb}</span>
                  </div>
                  <span className="ws-size">{Math.round(body.length / 10) / 100} KB</span>
                </button>
                {isOpen && <pre className="ws-body">{body}</pre>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SkillCard({ skill, meta, isOn, disabled, onToggle, onRun }) {
  return (
    <div className={`skill-card ${isOn ? 'skill-card-on' : 'skill-card-off'}`}>
      <div className="skill-card-head">
        <div className="skill-card-icon">{meta.glyph || '◯'}</div>
        <div className="skill-card-title-wrap">
          <div className="skill-card-title">{skill.label}</div>
          <code className="skill-card-id">{skill.id}</code>
        </div>
        <button
          className={`switch ${isOn ? 'on' : ''}`}
          onClick={onToggle}
          aria-label={`Toggle ${skill.id}`}
        >
          <span className="switch-knob" />
        </button>
      </div>

      <p className="skill-card-desc">{skill.description}</p>

      <div className="skill-card-foot">
        <div className="skill-uses">
          <span className="skill-uses-label">uses</span>
          {(meta.uses || []).map((u) => (
            <span key={u} className="skill-uses-chip">{u}</span>
          ))}
        </div>
        <button
          className="btn btn-sm"
          onClick={onRun}
          disabled={!isOn || disabled || !meta.goalId}
          title={!isOn ? 'Enable this skill to run it' : 'Run just this skill'}
        >
          ▷ Run skill
        </button>
      </div>
    </div>
  );
}

function ToolCard({ tool }) {
  return (
    <div className="tool-card">
      <div className="tool-card-head">
        <div className="tool-card-icon">{tool.glyph}</div>
        <div className="tool-card-title-wrap">
          <code className="tool-card-title">tools.{tool.title}</code>
          <span className="pill pill-ok">live</span>
        </div>
      </div>
      <p className="tool-card-desc">{tool.description}</p>
      <div className="tool-methods">
        {tool.methods.map((m) => (
          <code key={m} className="tool-method">{tool.title}.{m}()</code>
        ))}
      </div>
      <p className="tool-note">{tool.note}</p>
    </div>
  );
}
