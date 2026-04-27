/**
 * Agent runtime — orchestrates a goal end-to-end.
 *
 * Lifecycle:
 *   1. startRun (clears agent store, marks running)
 *   2. emit 'workspace:read' for IDENTITY / SOUL / USER (agent loading context)
 *   3. emit 'plan' with the chosen skills
 *   4. for each skill: skill:start → run generator → skill:done
 *   5. compose summary, emit 'goal:done', mark store status 'done'
 *
 * The runtime is intentionally streaming. Each `emit(...)` lands on the agent
 * store immediately, which `useSyncExternalStore` flushes to the React tree.
 * That's how the workflow page animates without us writing any animation code.
 */

import { agentActions, getAgent } from '../store/useAgentStore.js';
import { getFinance } from '../store/useFinanceStore.js';
import { GOAL_BY_ID } from './goals.js';
import { planGoal } from './planner.js';
import { tools } from './tools/index.js';
import { renderUserMd } from './workspace/index.js';
import { narrateRun } from './llm.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * `emit(...)` is passed into each skill generator. Returning the event lets
 * skills `yield emit(...)` so the generator pauses naturally between events
 * (gives the UI a moment to paint each new line).
 */
function emit(event) {
  agentActions.emit(event);
  return event;
}

export async function runGoal(goalId) {
  const goal = GOAL_BY_ID[goalId];
  if (!goal) throw new Error(`Unknown goal: ${goalId}`);

  agentActions.startRun({ goalId, goalLabel: goal.label });

  try {
    // 1. The agent reads its workspace — purely cosmetic, but it's faithful
    //    to the OpenClaw mental model and gives the timeline a meaningful intro.
    emit({ type: 'thought', text: `Goal accepted: ${goal.label}.` });
    await sleep(220);

    emit({ type: 'workspace:read', file: 'IDENTITY.md' });
    await sleep(180);
    emit({ type: 'workspace:read', file: 'SOUL.md' });
    await sleep(160);
    const userMd = renderUserMd(getFinance());
    emit({ type: 'workspace:read', file: 'USER.md', preview: userMd });
    await sleep(180);

    // 2. Planner picks skills based on the goal + user toggles.
    const enabled = getFinance().settings.enabledSkills;
    const plan = planGoal(goalId, enabled);

    if (plan.length === 0) {
      emit({ type: 'finding', severity: 'warn', title: 'No skills enabled for this goal', body: 'Toggle some skills back on in Settings → Agent skills.' });
      agentActions.fail('Plan is empty.');
      return;
    }

    emit({
      type: 'plan',
      skills: plan.map((s) => ({ id: s.id, label: s.label })),
    });
    await sleep(260);

    // 3. Run each skill in order. Skills are async generators — we drain them.
    const results = {};
    for (const skill of plan) {
      emit({ type: 'skill:start', skillId: skill.id, label: skill.label });
      await sleep(180);

      const ctx = { tools, emit, sleep };
      const gen = skill.run(ctx);

      let last;
      while (true) {
        const step = await gen.next();
        if (step.done) {
          last = step.value;
          break;
        }
      }
      results[skill.id] = last;

      emit({ type: 'skill:done', skillId: skill.id, summary: summarizeSkill(skill.id, last) });
      await sleep(220);
    }

    // 4. Final goal summary.
    const summary = summarizeRun(goal, results, getAgent().events);
    emit({ type: 'goal:done', summary });

    // 5. Optional Live AI narration. Opt-in only — pure deterministic path
    //    above always finishes first, so a Claude failure never breaks the run.
    const { settings } = getFinance();
    if (settings.liveAi?.enabled && settings.liveAi?.apiKey) {
      try {
        emit({ type: 'thought', text: 'Live AI on — asking Claude to narrate this run…' });
        await sleep(160);
        const { text, usage, model } = await narrateRun({
          apiKey: settings.liveAi.apiKey,
          goal,
          events: getAgent().events,
          userContext: renderUserMd(getFinance()),
        });
        if (text) {
          emit({ type: 'narration', body: text, model, usage });
        }
      } catch (err) {
        console.error('[live-ai] narration failed', err);
        emit({
          type: 'finding',
          severity: 'info',
          title: 'Live narration unavailable',
          body: err.message ?? 'Claude call failed. Falling back to deterministic summary.',
        });
      }
    }

    agentActions.finish(summary);
    tools.notify.toast('Agent run complete', 'ok');
  } catch (err) {
    console.error('[agent] run failed', err);
    emit({ type: 'finding', severity: 'warn', title: 'Run failed', body: err.message });
    agentActions.fail(err.message ?? 'Unknown error');
  }
}

function summarizeSkill(id, result) {
  if (!result) return 'done';
  if (id === 'categorize') return `${result.updates ?? 0} updated of ${result.scanned ?? 0} scanned`;
  if (id === 'insights')   return `${result.count ?? 0} ${result.count === 1 ? 'finding' : 'findings'}`;
  if (id === 'saver') {
    if (result.skipped) return 'no goal set';
    if (result.hit)     return 'goal already hit';
    if (result.approved) return `topped up $${result.gap}`;
    if (result.paymentBlocked) return 'no headroom';
    return 'top-up declined';
  }
  if (id === 'report') return 'wrote monthly report';
  return 'done';
}

function summarizeRun(goal, results, events) {
  const findings = events.filter((e) => e.type === 'finding').length;
  const skillCount = Object.keys(results).length;
  return `${goal.label} complete · ${skillCount} ${skillCount === 1 ? 'skill' : 'skills'} run, ${findings} ${findings === 1 ? 'finding' : 'findings'} surfaced.`;
}
