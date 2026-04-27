/**
 * Live AI mode (Step 14, opt-in).
 *
 * When the user pastes an Anthropic API key in Settings and flips the toggle,
 * the runtime calls `narrateRun(...)` after every goal. Claude reads the run's
 * event log and writes a short, in-character summary in the agent's voice.
 *
 * Skills still execute locally — Claude only writes the narration. That keeps
 * live mode demo-safe: a network blip degrades to "the deterministic summary
 * we already had", never breaks the run.
 *
 * Prompt caching: the workspace markdown is large and changes rarely, so it
 * goes in the system prompt with cache_control. The variable run log is sent
 * fresh in the user message. After the first call, subsequent runs in the
 * same session get a cache hit on the system block.
 *
 * The browser flag (`dangerouslyAllowBrowser: true`) is required because the
 * key lives in the user's own localStorage and never leaves their machine.
 * That's a deliberate hackathon-demo trade-off, not a production pattern.
 */

import Anthropic from '@anthropic-ai/sdk';
import { WORKSPACE } from './workspace/index.js';

const MODEL = 'claude-haiku-4-5-20251001';

function systemPrompt() {
  const workspaceText = [
    '# IDENTITY.md',
    WORKSPACE.IDENTITY,
    '',
    '# SOUL.md',
    WORKSPACE.SOUL,
    '',
    '# AGENTS.md',
    WORKSPACE.AGENTS,
    '',
    '# TOOLS.md',
    WORKSPACE.TOOLS,
  ].join('\n');

  return [
    {
      type: 'text',
      text: 'You are FinanceBuddy AI, a local-first finance agent. Below is your workspace — your identity, voice, operating rules, and toolbox. Read it carefully before responding.',
    },
    {
      type: 'text',
      text: workspaceText,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function compactEvents(events) {
  return events.map((e) => {
    const copy = { ...e };
    delete copy.id;
    delete copy.ts;
    return copy;
  });
}

export async function narrateRun({ apiKey, goal, events, userContext }) {
  if (!apiKey) throw new Error('Live AI is on but no API key was provided.');

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const userMsg = [
    `Goal just completed: ${goal.label}`,
    '',
    `User snapshot:\n${userContext}`,
    '',
    'Event log (chronological):',
    JSON.stringify(compactEvents(events), null, 2),
    '',
    'Write a 2-sentence narration in your voice (warm, plain-language, "buddy" tone). The first sentence reports what you found or did; the second offers one concrete next step or a reassuring close. No greeting, no preamble, no markdown.',
  ].join('\n');

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 240,
    system: systemPrompt(),
    messages: [{ role: 'user', content: userMsg }],
  });

  const block = res.content.find((c) => c.type === 'text');
  return {
    text: block?.text?.trim() ?? '',
    usage: res.usage,
    model: res.model,
  };
}
