import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveBuilds } from './LiveBuilds';
import { bonusPrompt, type Milestone, milestonePrompt } from './prompts';

const code = 'rounded bg-muted px-1.5 py-0.5 font-mono text-xs';

/**
 * Workshop helper: the prompt to paste into your coding agent next, straight from docs/WORKSHOP.md §3.
 * `next={1}` on main, `next={2}` on checkpoint/m1 … `next="done"` on checkpoint/m4. Not rendered on `solution`.
 * Also links the live builds still ahead: every checkpoint and the solution on main, only the solution after M4.
 */
export function NextPrompt({ next }: { next: Milestone | 'done' }) {
  const step = next === 'done' ? bonusPrompt() : milestonePrompt(next);
  const eyebrow =
    next === 'done' ? 'All four milestones built' : next === 1 ? 'Start here · 1 of 4' : `Next · ${next} of 4`;

  return (
    <Card className="border-dashed">
      <CardHeader className="flex-row items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <TerminalIcon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
          <CardTitle>{step ? `${step.label}: ${step.title}` : 'Open the workshop guide'}</CardTitle>
          <CardDescription>
            {next === 'done' ? (
              <>
                Compare yours with the <code className={code}>solution</code> branch (vault list + modal, SDK/API
                toggle), or rebrand it: fill in the two placeholders, then paste.
              </>
            ) : (
              'Paste this into your coding agent. A fresh session per milestone works best.'
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {step ? (
          <PromptBox prompt={step.prompt} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Open <code className={code}>docs/WORKSHOP.md</code> and give your agent the next prompt from §3.
          </p>
        )}
        {step?.check && (
          <p className="text-sm">
            <span className="font-semibold">Check:</span> {step.check}
          </p>
        )}
        <LiveBuilds from={next === 'done' ? 5 : next} />
        <p className="text-xs text-subtle-foreground">
          From <code className={code}>docs/WORKSHOP.md</code>.
          {next !== 'done' && ' Your agent moves this card on when a milestone is done.'}
        </p>
      </CardContent>
    </Card>
  );
}

function PromptBox({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-md border bg-muted/50 p-4 sm:pr-28">
      <p className="font-mono text-xs leading-relaxed">{prompt}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 sm:absolute sm:top-3 sm:right-3 sm:mt-0"
        onClick={() => void copy()}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
