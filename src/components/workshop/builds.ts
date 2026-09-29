/**
 * Hosted builds of each reference branch (Vercel deployments of the open checkpoint and solution PRs).
 * Listed on the starter page and in docs/WORKSHOP.md; keep the two in sync.
 */
export const LIVE_BUILDS = [
  {
    branch: 'checkpoint/m1',
    label: 'After M1',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m1-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m2',
    label: 'After M2',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m2-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m3',
    label: 'After M3',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m3-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m4',
    label: 'After M4',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m4-icon-foundation.vercel.app/',
  },
  {
    branch: 'solution',
    label: 'Finished app',
    url: 'https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app/',
  },
] as const;
