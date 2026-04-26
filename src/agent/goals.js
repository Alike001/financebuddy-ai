/**
 * Goals are user-facing entry points to the agent. The Agent Workflow page
 * shows a "Run goal" button for each one. The planner maps them to ordered
 * skill lists.
 */
export const GOALS = [
  {
    id: 'full-review',
    label: 'Run full review',
    blurb: 'Categorize, hunt for patterns, coach savings, write a report.',
    skills: ['categorize', 'insights', 'saver', 'report'],
  },
  {
    id: 'categorize',
    label: 'Re-categorize ledger',
    blurb: 'Tag any transaction stuck in "Other".',
    skills: ['categorize'],
  },
  {
    id: 'find-risks',
    label: 'Find risky patterns',
    blurb: 'Flag overspend, deficits, and subscription stacks.',
    skills: ['insights'],
  },
  {
    id: 'savings-coach',
    label: 'Coach my savings',
    blurb: 'Compare goal vs actual, propose a top-up if room exists.',
    skills: ['saver'],
  },
  {
    id: 'write-report',
    label: 'Write monthly report',
    blurb: 'One-paragraph summary of the month.',
    skills: ['report'],
  },
];

export const GOAL_BY_ID = Object.fromEntries(GOALS.map((g) => [g.id, g]));
