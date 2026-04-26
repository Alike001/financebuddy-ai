import { GOAL_BY_ID } from './goals.js';
import { SKILLS } from './skills/index.js';

/**
 * Picks the ordered list of skills to run for a given goal id.
 * Filters by the user's enabled-skills list from settings — a skill toggled
 * off in Settings is silently dropped from the plan.
 *
 * Why this is its own file: the OpenClaw mental model separates planning
 * (what to do) from execution (how to do it). Keeping the planner pure makes
 * it trivial to swap with an LLM-driven planner later.
 */
export function planGoal(goalId, enabledSkillIds) {
  const goal = GOAL_BY_ID[goalId];
  if (!goal) throw new Error(`Unknown goal: ${goalId}`);

  const enabled = new Set(enabledSkillIds);
  return goal.skills
    .filter((id) => enabled.has(id))
    .map((id) => SKILLS[id])
    .filter(Boolean);
}
