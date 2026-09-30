import workshop from '../../../docs/WORKSHOP.md?raw';

/**
 * Workshop prompts, read from docs/WORKSHOP.md at build time so the in-app card never drifts from the runbook.
 * §2 (agenda) gives each milestone's title and check; §3 gives the prompt, in a fenced block under "**M1**" etc.
 * (and "**All at once**" for the one-shot prompt, "**Bonus: rebrand**" for the bonus).
 * Keep those headings, fences and agenda rows in that shape; if they stop matching, the card falls back to a link.
 */

export type Milestone = 1 | 2 | 3 | 4;

export type WorkshopPrompt = {
  /** "Milestone 2", "Bonus". */
  label: string;
  /** "Execute deposit + shares". */
  title: string;
  /** What to check afterwards, from the timeline. */
  check?: string;
  /** The prompt as one paragraph (the runbook hard-wraps it). */
  prompt: string;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function promptBlock(heading: string): string | undefined {
  const match = workshop.match(new RegExp(`\\*\\*${escapeRegExp(heading)}\\*\\*\\s*\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``));
  return match?.[1]?.split('\n').join(' ').replace(/\s+/g, ' ').trim();
}

/** The timeline row "| 0:17 | **M2** Execute deposit + shares | Paste prompt M2. … Check: … |". */
function timelineRow(milestone: Milestone): { title?: string; check?: string } {
  const row = workshop.match(new RegExp(`\\|\\s*\\*\\*M${milestone}\\*\\*\\s*([^|]+)\\|([^|]+)\\|`));
  return {
    title: row?.[1]?.trim(),
    check: row?.[2]
      ?.match(/Check:\s*(.+)/)?.[1]
      ?.replace(/\*\*/g, '')
      .trim(),
  };
}

export function milestonePrompt(milestone: Milestone): WorkshopPrompt | undefined {
  const prompt = promptBlock(`M${milestone}`);
  if (!prompt) return undefined;
  const { title, check } = timelineRow(milestone);
  return { label: `Milestone ${milestone}`, title: title ?? '', check, prompt };
}

export function bonusPrompt(): WorkshopPrompt | undefined {
  const prompt = promptBlock('Bonus: rebrand');
  return prompt ? { label: 'Bonus', title: 'Rebrand the app', prompt } : undefined;
}

/** The one-shot prompt: all four milestones in one go, for capable agents. Its check is the line above it in §3. */
export function oneShotPrompt(): WorkshopPrompt | undefined {
  const prompt = promptBlock('All at once');
  if (!prompt) return undefined;
  const check = workshop
    .match(/Check:\s*((?:[^\n]|\n(?!\n))+?)\n\n\*\*All at once\*\*/)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim();
  return { label: 'All at once', title: 'Build the whole vault app in one prompt', check, prompt };
}
