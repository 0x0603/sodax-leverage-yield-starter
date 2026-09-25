import { HammerIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Mount point for the Leverage Yield feature. Replace this placeholder with the vault UI.
 *
 * Start here: docs/WORKSHOP.md → Milestone 1. Agents: read AGENTS.md and
 * .agents/skills/sodax-leverage-yield/SKILL.md first.
 */
export function LeverageYieldPage() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <HammerIcon className="size-5" />
        </div>
        <CardTitle>Build the vault feature here</CardTitle>
        <CardDescription>
          This is{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            src/features/leverage-yield/LeverageYieldPage.tsx
          </code>
          . Open <code className="rounded bg-muted px-1.5 py-0.5 text-xs">docs/WORKSHOP.md</code> and give your agent
          the Milestone 1 prompt.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Wallet connection, the SODAX SDK and the theme are already wired. You only build the vault UI.
      </CardContent>
    </Card>
  );
}
