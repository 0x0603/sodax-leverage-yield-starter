import { ExternalLinkIcon } from 'lucide-react';
import { NextPrompt } from '@/components/workshop/NextPrompt';

/** The finished app (branch `solution`), for a look before you build. */
const SOLUTION_URL = 'https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app/';

/**
 * Mount point for the Leverage Yield feature. Replace the rest of this page with the vault UI.
 *
 * Start here: docs/WORKSHOP.md → Milestone 1. Agents: read AGENTS.md and
 * .agents/skills/sodax-leverage-yield/SKILL.md first.
 */
export function LeverageYieldPage() {
  return (
    <div className="flex flex-col gap-4">
      <NextPrompt next={1} />
      <p className="text-center text-sm text-muted-foreground">
        Wallet connection, the SODAX SDK and the theme are already wired. You build the vault UI in{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">src/features/leverage-yield/</code>.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Want to see where you're headed?{' '}
        <a
          href={SOLUTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Open the finished app
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </p>
    </div>
  );
}
