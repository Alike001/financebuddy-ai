/**
 * Workspace files exposed as JS strings.
 *
 * In OpenClaw, these are markdown documents on disk that the agent reads at
 * the start of each turn — IDENTITY, SOUL, AGENTS, TOOLS, USER. We mirror the
 * same idea so the Agent Workflow page can render `workspace:read` events as
 * the agent actually inspecting its own context.
 *
 * Vite's `?raw` import lets us load the .md files at build time. USER.md is
 * a template that gets filled per-run from the live store.
 */

import IDENTITY from './IDENTITY.md?raw';
import SOUL from './SOUL.md?raw';
import AGENTS from './AGENTS.md?raw';
import TOOLS from './TOOLS.md?raw';
import USER_TEMPLATE from './USER.md?raw';

import { today } from '../../utils/date.js';

export const WORKSPACE = { IDENTITY, SOUL, AGENTS, TOOLS, USER_TEMPLATE };

export function renderUserMd(state) {
  const { profile, settings } = state;
  return USER_TEMPLATE
    .replace('{{name}}', profile.name || '(unset)')
    .replace('{{currency}}', profile.currency)
    .replace('{{monthlyIncome}}', String(profile.monthlyIncome))
    .replace('{{savingsGoal}}', String(profile.savingsGoal))
    .replace('{{today}}', today())
    .replace('{{enabledSkills}}', settings.enabledSkills.join(', ') || '(none)')
    .replace('{{liveAi}}', settings.liveAi.enabled ? 'on' : 'off');
}
