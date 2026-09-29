# Running the workshop

For whoever prepares and runs the workshop. Participants follow [WORKSHOP.md](WORKSHOP.md): agenda, prompts,
catch-up and troubleshooting.

**Format:** ~60 minutes, in person. Frontend developers use a coding agent to add pooled vault deposits to a React
app, then make a real mainnet deposit.

**Outcome:** every participant leaves with a working vault app and at least one real deposit in a SODAX vault.

## 1. Checklist

| When | Task |
|---|---|
| 1 week before | Send §1 "Before you start" of WORKSHOP.md with the invite (2–3 days before at the latest). Ask the SODAX backend team to raise api.sodax.com rate limits for the venue IP. |
| 48 h before | **Freeze `main`** and all checkpoint branches. Tag the release (`git tag workshop-YYYY-MM-DD`). |
| Day before | `pnpm preflight`: API, RPCs, all vaults and the quote matrix must be green. Note the minimum deposit it reports; if it's above ~$2, update the "Amount too low" row in WORKSHOP.md. |
| Day before | On the hosted `solution`: one real $5 deposit and one withdrawal in **SDK** mode, and the same in **API** mode. Time them. |
| Day before | Timed dry run from `main` with Claude Code, Codex and Cursor, milestone by milestone. |
| Morning of | `pnpm preflight` again **on the venue network**. Have the hosted `solution` URL on a slide. |
| During | Keep the catch-up commands and troubleshooting table on screen. |

The **hosted solution** (GitHub Pages build of branch `solution`, at
`https://gosodax.github.io/sodax-leverage-yield-starter/` once Pages is enabled and the "Deploy solution to
Pages" workflow has run) is the safety net: anyone whose code breaks can still see their shares and withdraw there.
Deposits are tied to wallet + network, not to the app.

## 2. Running the session

- **Intro (5 min):** walk through WORKSHOP.md §6 with a slide of the deposit flow (wallet → intent → solver → hub
  wallet). Say the risks out loud, and where shares live. Everyone opens the app and connects.
- **M2:** make sure **everyone makes a real ~$5 deposit**. If time is short, M2 is the one that matters: move people
  to `checkpoint/m2` so they can deposit.
- **Wrap (6 min):** show the hosted `solution` (list + modal UX, the SDK/API toggle), rebranding with the bonus
  prompt, the docs and skills; then Q&A.

## 3. The in-app prompt card

`main` and the checkpoints show the next prompt at the top of the page (`src/components/workshop/NextPrompt.tsx`).
It reads WORKSHOP.md at build time (`src/components/workshop/prompts.ts`):

- the prompts: the fenced block under each `**M1**` … `**M4**` and `**Bonus: rebrand**` heading;
- each milestone's title and check: the agenda row `| **M1** <title> | … Check: <check> |`.

Keep those headings, fences and rows in that shape when you edit WORKSHOP.md. If they stop matching, the card falls
back to "Open docs/WORKSHOP.md".

## 4. Maintaining the branches

The branches form one linear stack: `main` → `checkpoint/m1` → `m2` → `m3` → `m4` → `solution`. Each checkpoint
only adds files under `src/features/leverage-yield/`. After changing `main`, restack and re-verify:

```bash
git switch checkpoint/m1 && git rebase main
git switch checkpoint/m2 && git rebase checkpoint/m1
git switch checkpoint/m3 && git rebase checkpoint/m2
git switch checkpoint/m4 && git rebase checkpoint/m3
git switch solution      && git rebase checkpoint/m4
git push --force-with-lease origin main checkpoint/m1 checkpoint/m2 checkpoint/m3 checkpoint/m4 solution
```

CI runs `pnpm check` and `pnpm build` on every branch. Re-run "Deploy solution to Pages" afterwards.

To move to a new SDK release: update the `@sodax/*` pins in `package.json` and `EXPECTED` in
`scripts/check-versions.ts`, run `pnpm install && pnpm check && pnpm preflight` on every branch, and re-check the
skill's API table against the new `.d.ts` files.
