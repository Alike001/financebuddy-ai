/**
 * Agent Workflow — the demo's hero page.
 *
 * The flow:
 *   1. User picks a goal (e.g. "Run full review").
 *   2. runGoal() kicks off the agent runtime, which streams events into the
 *      agent store via useSyncExternalStore.
 *   3. This page subscribes to those events and animates them into a timeline.
 *   4. If a skill calls tools.pay.simulate(...), pendingPayment lands on the
 *      store and the approval card slides in. The runtime is awaiting the
 *      user's decision — Approve / Reject resolves the in-flight Promise.
 *
 * Everything visible on this page comes from the same event stream OpenClaw
 * agents emit, just rendered as React. No live LLM, no network — every line
 * is the runtime narrating its own real work.
 */

import { useAgentStore } from '../store/useAgentStore.js';
import { GOALS } from '../agent/goals.js';
import { runGoal } from '../agent/runtime.js';
import PaymentSimulatorPanel from '../components/PaymentSimulatorPanel.jsx';

function statusPill(status) {
  if (status === 'running') return { className: 'pill pill-info', label: 'Running' };
  if (status === 'done')    return { className: 'pill pill-ok',   label: 'Run complete' };
  if (status === 'error')   return { className: 'pill pill-warn', label: 'Run failed' };
  return { className: 'pill', label: 'Idle' };
}

export default function AgentWorkflow() {
  const { status, goalLabel, events, summary, pendingPayment } = useAgentStore();
  const isRunning = status === 'running';
  const pill = statusPill(status);
  const blocked = isRunning || !!pendingPayment;

  function handleRun(goalId) {
    if (blocked) return;
    runGoal(goalId);
  }

  return (
    <section className="page">
      <div className="page-head workflow-head">
        <div>
          <h2 className="page-title">Agent Workflow</h2>
          <p className="page-sub">
            Pick a goal — the agent reads its workspace, plans, runs each skill, and narrates every step in real time.
          </p>
        </div>
        <span className={pill.className}>
          {status === 'running' && <span className="live-dot" />}
          {pill.label}
        </span>
      </div>

      <div className="goal-grid">
        {GOALS.map((g) => (
          <button
            key={g.id}
            className="goal-card"
            onClick={() => handleRun(g.id)}
            disabled={blocked}
          >
            <div className="goal-card-top">
              <div className="goal-label">{g.label}</div>
              <span className="goal-arrow">→</span>
            </div>
            <div className="goal-blurb">{g.blurb}</div>
            <div className="goal-skills">
              {g.skills.map((s) => (
                <span key={s} className="goal-skill-chip">{s}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <PaymentSimulatorPanel />

      <div className="card timeline-card">
        <div className="card-head">
          <div className="timeline-head-left">
            <div className="card-title">{goalLabel || 'Reasoning timeline'}</div>
            {summary && <div className="timeline-summary">{summary}</div>}
            {!summary && events.length === 0 && (
              <div className="timeline-summary">Run a goal above to see the agent reason in real time.</div>
            )}
          </div>
          {isRunning && (
            <span className="pill pill-info"><span className="live-dot" /> live</span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="placeholder-card timeline-empty">
            Nothing here yet — pick a goal to wake up the agent.
          </div>
        ) : (
          <ol className="timeline">
            {events.map((e, i) => (
              <TimelineRow
                key={e.id}
                event={e}
                isLatest={i === events.length - 1}
                isRunning={isRunning}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function TimelineRow({ event, isLatest, isRunning }) {
  const live = isLatest && isRunning;
  const cls = `tl-row tl-${event.type.replace(':', '-')}${live ? ' tl-live' : ''}`;

  switch (event.type) {
    case 'thought':
      return (
        <li className={cls}>
          <span className="tl-glyph">◌</span>
          <span className="tl-body tl-mute">{event.text}</span>
        </li>
      );

    case 'workspace:read':
      return (
        <li className={cls}>
          <span className="tl-glyph">⌘</span>
          <div className="tl-body">
            <span>Reading workspace file </span>
            <code className="tl-code">{event.file}</code>
            {event.preview && (
              <details className="tl-preview">
                <summary>show contents</summary>
                <pre>{event.preview}</pre>
              </details>
            )}
          </div>
        </li>
      );

    case 'plan':
      return (
        <li className={cls}>
          <span className="tl-glyph">❑</span>
          <div className="tl-body">
            <div className="tl-strong">Plan ready · {event.skills.length} {event.skills.length === 1 ? 'skill' : 'skills'}</div>
            <div className="tl-chips">
              {event.skills.map((s, i) => (
                <span key={s.id} className="tl-plan-chip">
                  <span className="tl-plan-num">{i + 1}</span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </li>
      );

    case 'skill:start':
      return (
        <li className={cls}>
          <span className="tl-glyph tl-glyph-skill">▷</span>
          <div className="tl-body">
            <span className="tl-strong">{event.label}</span>
            <span className="tl-mute"> · skill <code className="tl-code">{event.skillId}</code> started</span>
          </div>
        </li>
      );

    case 'skill:done':
      return (
        <li className={cls}>
          <span className="tl-glyph tl-glyph-ok">✓</span>
          <div className="tl-body">
            <code className="tl-code">{event.skillId}</code>
            <span className="tl-mute"> done · {event.summary}</span>
          </div>
        </li>
      );

    case 'tool:call':
      return (
        <li className={cls}>
          <span className="tl-glyph">⇄</span>
          <div className="tl-body">
            <code className="tl-code">{event.tool}.{event.action}</code>
            {event.args && Object.keys(event.args).length > 0 && (
              <span className="tl-mute"> · {summarizeArgs(event.args)}</span>
            )}
            {event.result && <span className="tl-mute"> → {event.result}</span>}
          </div>
        </li>
      );

    case 'finding': {
      const sev = event.severity || 'info';
      const glyph = sev === 'warn' ? '⚠' : sev === 'good' ? '★' : '◉';
      return (
        <li className={`${cls} tl-finding-${sev}`}>
          <span className="tl-glyph tl-glyph-finding">{glyph}</span>
          <div className="tl-body">
            <div className="tl-strong">{event.title}</div>
            {event.body && <div className="tl-finding-body">{event.body}</div>}
          </div>
        </li>
      );
    }

    case 'goal:done':
      return (
        <li className={cls}>
          <span className="tl-glyph tl-glyph-final">✦</span>
          <div className="tl-body">
            <div className="tl-strong">{event.summary}</div>
          </div>
        </li>
      );

    case 'narration':
      return (
        <li className={cls}>
          <span className="tl-glyph tl-glyph-narration">✺</span>
          <div className="tl-body">
            <div className="tl-narration">
              <span className="pill pill-info tl-narration-pill">live AI</span>
              {event.model && <code className="tl-code tl-narration-model">{event.model}</code>}
            </div>
            <div className="tl-narration-body">{event.body}</div>
          </div>
        </li>
      );

    default:
      return null;
  }
}

function summarizeArgs(args) {
  return Object.keys(args)
    .slice(0, 3)
    .map((k) => `${k}: ${formatArg(args[k])}`)
    .join(', ');
}

function formatArg(v) {
  if (v == null) return '—';
  if (typeof v === 'string') return v.length > 28 ? v.slice(0, 26) + '…' : v;
  if (typeof v === 'number') return String(v);
  return JSON.stringify(v).slice(0, 28);
}
