# FinanceBuddy AI

> *Your local-first AI finance agent. OpenClaw-style skills. Real-time reasoning. Zero cloud.*

A personal finance assistant where every smart action — categorizing a transaction, flagging a risky pattern, suggesting a savings goal, drafting a payment — is performed by a modular **OpenClaw-shaped agent** with composable Skills and Tools. The user always sees the agent's reasoning trace before any action is taken, and a human-in-the-loop modal gates every payment.

Built for the **Mini Hack Agents / OpenClaw** hackathon.

## Features

- **Onboarding** — name, monthly income, currency, savings goal. One-time, persisted.
- **Dashboard** — totals, category pie, 30-day daily-spend bar, top 5 expenses, agent insight card. Cold-start hero when the ledger is empty.
- **Transactions** — add / edit / delete with auto-categorization on entry.
- **Agent Workflow page** — pick a goal, watch the timeline animate. Workspace reads, plan steps, skill runs, tool calls, findings, and a final summary card.
- **Skills marketplace** — `categorize`, `insights`, `saver`, `report`. Toggle each on/off to see the planner skip them. Each card lists the tools the skill uses.
- **Payment Simulator** — preset payments (rent, electric, gym, savings top-up) plus a custom form. Each one routes through the same approval gate.
- **Reports** — month picker, narrative paragraph from the `report` skill, daily-spend bar, category donut, top 5 expenses with a `simulated` tag.
- **Settings** — theme toggle, currency, savings goal, skill enable/disable, erase data, view live workspace files.
- **Accessibility** — `prefers-reduced-motion` honored across all animations.
- **Optional live AI mode** — paste an Anthropic API key in Settings to upgrade narration to real Claude calls *(Step 14, opt-in only — default stays deterministic for stage safety)*.

## Tech stack

- **React 19** + **Vite 8** (JavaScript only — no TypeScript)
- **React Router v7** for page routing
- **Recharts 3.8** for charts
- **Plain CSS** with design tokens in `variables.css` (no Tailwind)
- **`localStorage`** wrapped by a tiny store built on `useSyncExternalStore`
- **Vite `?raw` imports** to bundle the workspace markdown files

No backend. No external APIs at runtime by default.

## Architecture (the OpenClaw-flavored part)

```
src/agent/
├── runtime.js           # the loop — emits events the UI subscribes to
├── planner.js           # maps goal → ordered skills (respects user toggles)
├── goals.js             # user-facing goal definitions
├── payment.js           # human-in-the-loop approval helpers
├── skills/
│   ├── categorize.js    # keyword + heuristic classifier
│   ├── insights.js      # subscription stacks, weekend overspend, deficits
│   ├── saver.js         # goal vs actual, may propose a top-up payment
│   └── report.js        # monthly narrative report
├── tools/
│   ├── ledger.js        # read/write transactions (the only path to the store)
│   ├── pay.js           # simulate a payment — pushes to approval modal
│   └── notify.js        # toast surface
└── workspace/
    ├── AGENTS.md        # operating instructions
    ├── SOUL.md          # tone & persona
    ├── IDENTITY.md      # "FinanceBuddy AI v0.1"
    ├── USER.md          # rendered live from the user profile
    └── TOOLS.md         # when to use each tool
```

**Skills are async generators.** They `yield emit(...)` to push events onto the timeline, `await tools.x.y(...)` for side effects, and `return` a result object the runtime summarizes. That's it — no framework, no decorators.

**Tools are a narrow facade.** Skills cannot reach into the React stores directly; every read or write goes through a tool. This makes the agent's surface area visible — the Skills page renders each tool as a card with its method list.

**Workspace files are real.** They're imported via Vite `?raw`, so the same markdown the agent "loads" is what renders in Settings and on the Skills page. Judges can verify the agent reads what it claims to read.

## Setup

```bash
git clone https://github.com/Alike001/financebuddy-ai.git
cd financebuddy-ai
npm install
npm run dev
```

The app boots at `http://localhost:5173`. First launch lands on onboarding — fill it in, or click **Load demo data** on the empty dashboard for a polished seed ledger.

## Project map

```
financebuddy-ai/
├── src/
│   ├── agent/             # runtime, skills, tools, workspace
│   ├── components/        # Layout, Sidebar, TopBar, charts, modals
│   ├── data/              # categories metadata, seed ledger
│   ├── pages/             # Onboarding, Dashboard, Transactions, AgentWorkflow, Skills, Reports, Settings
│   ├── store/             # tiny useSyncExternalStore-backed stores + localStorage wrapper
│   ├── styles/            # variables, global, layout, components, pages
│   └── utils/             # format, date, analytics, report composer, categorize
└── README.md
```

## Credits

Built by Ali for the Mini Hack Agents 2026 hackathon. Inspired by and structurally faithful to the OpenClaw architecture documented at [docs.openclaw.ai](https://docs.openclaw.ai).
