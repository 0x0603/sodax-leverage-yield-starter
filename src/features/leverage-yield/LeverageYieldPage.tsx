import { LiveBuilds } from '@/components/workshop/LiveBuilds';
import { NextPrompt } from '@/components/workshop/NextPrompt';

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
      <LiveBuilds />
    </div>
  );
}
