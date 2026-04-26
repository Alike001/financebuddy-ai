# AGENTS

Skills available to the runtime. Each skill is a pure function of
`(context) → events`. The planner picks an ordered subset based on the user's
goal and the skills they have enabled in Settings.

| id          | name                | when to use                                     |
| ----------- | ------------------- | ----------------------------------------------- |
| categorize  | Auto-categorizer    | Tag any transaction whose category is "other".  |
| insights    | Pattern spotter     | Find weekend overspend, deficit, top-cat dominance, subscription stack. |
| saver       | Savings coach       | Compare actual savings to goal; propose a tweak. |
| report      | Monthly report      | Produce a 1-paragraph human-readable summary.    |

Skills MUST be safe to re-run. They MUST emit a `skill:done` event with a
short summary. They SHOULD emit `finding` events for anything the workflow
timeline should highlight.
