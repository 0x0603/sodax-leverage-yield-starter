/**
 * Hosted builds of each reference branch (Vercel deployments of the open checkpoint and solution PRs).
 * Shown in the NextPrompt card (only the builds still ahead) and listed in docs/WORKSHOP.md §4; keep the two in sync.
 * `milestone` is the last milestone the build includes; the solution counts as 5.
 */
export const LIVE_BUILDS = [
  {
    branch: 'checkpoint/m1',
    milestone: 1,
    label: 'After M1',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m1-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m2',
    milestone: 2,
    label: 'After M2',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m2-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m3',
    milestone: 3,
    label: 'After M3',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m3-icon-foundation.vercel.app/',
  },
  {
    branch: 'checkpoint/m4',
    milestone: 4,
    label: 'After M4',
    url: 'https://sodax-leverage-yield-starter-git-checkpoint-m4-icon-foundation.vercel.app/',
  },
  {
    branch: 'solution',
    milestone: 5,
    label: 'Finished app',
    url: 'https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app/',
  },
] as const;
