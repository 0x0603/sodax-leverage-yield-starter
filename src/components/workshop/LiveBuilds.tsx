import { ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIVE_BUILDS } from './builds';

/** Links to the hosted build of every checkpoint and the solution, for a look before (or while) you build. */
export function LiveBuilds() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        Want to see where you're headed? Each milestone's reference build is live:
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {LIVE_BUILDS.map(build => {
          const final = build.branch === 'solution';
          return (
            <li key={build.branch}>
              <a
                href={build.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Branch ${build.branch}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                  final
                    ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-card text-foreground hover:bg-muted',
                )}
              >
                {build.label}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
