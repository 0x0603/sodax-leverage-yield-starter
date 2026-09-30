# AGENTS.md

Guidance for coding agents (Claude Code, Codex, Cursor, Copilot and others) working in this repo. Read this before
you change any code.

## What this is

A whitelabel React starter for building **SODAX Leverage Yield**: pooled ERC-4626 vaults whose shares are `lsoda*`
tokens (lsodaWEETH, lsodaWSTETH, lsodaJITOSOL, lsodaSUSDS). Users deposit any supported token from an EVM chain and
receive vault shares; they can withdraw later.

**Scope: vaults only.** Leverage *positions* are a different product. Never use `useLeveragePosition*`,
`useOpenLeveragePosition`, `useSubmitLeveragePositionIntent`, `useRunLeveragePositionOperation`,
`openLeveragePosition` or any other position API. If a doc or skill asks "vault or leverage position?", the answer is
**vault**.

Already done for you: wallet connection (EVM only), the SODAX SDK provider (mainnet), theme and layout. You build the
vault UI in `src/features/leverage-yield/`.

## Real money

This app runs on **mainnet with real funds**. There is no testnet vault.

- Never set `minOutputAmount` to `0`. Derive it from a live quote with `minAmountAfterSlippage()`
  (`src/lib/format.ts`).
- Slippage must stay at or below `MAX_SLIPPAGE_BPS` (`src/config/workshop.ts`).
- Never pass `skipSimulation`.
- Never ask for, read or store private keys or seed phrases, and never write scripts that sign or send
  transactions. Users sign in their own wallet, in the browser.
- No partner fee. Don't copy `DEPOSIT_PARTNER_FEE` or any fee address from SODAX demos or docs.
- Don't adjust amounts with `adjustAmountByFee` when quoting with `useLeverageYieldQuote`: it already deducts the
  fee, so adjusting again deducts it twice.
- Show the user what they'll receive, the minimum they'll accept and the risks (see the skill) before they sign.

## Commands

```bash
pnpm install     # once
pnpm dev         # http://localhost:5173
pnpm check       # typecheck + lint + version/skill/format guards. Run after every change.
pnpm build       # production build
pnpm preflight   # read-only health check of the SODAX API, RPCs and quote routes
```

## Where things are

| Path | What | Edit? |
|---|---|---|
| `src/features/leverage-yield/` | The vault feature. `LeverageYieldPage.tsx` is the mount point. | **Yes: build here** |
| `src/config/workshop.ts` | Source chains, default vault/token, slippage, polling, token helpers | Yes, if needed |
| `src/wallet/useEvmWallet.ts` | The one wallet hook feature code uses | No |
| `src/lib/format.ts`, `src/lib/chains.ts` | Unit, formatting and explorer helpers | Add helpers if needed |
| `src/components/ui/` | Button, Card, Dialog, Select, Input, Badge, Callout, Skeleton, Tooltip | Reuse; add new primitives here |
| `src/brand/` | `theme.css` (all colours/fonts/radii), `brand.config.ts` (name, logos) | Only for rebranding |
| `src/providers.tsx`, `src/config/{rpc,sodax,wallet}.ts`, `vite.config.ts` | SDK + wallet wiring | **No** |

## Rules

1. **Wallet:** use `useEvmWallet(chainKey)` from `@/wallet`. It returns `{ address, isConnected, walletProvider,
   isWrongChain, switchChain, connect, currentChainKey }`. Pass `walletProvider` to SDK calls; show a "Switch
   network" button when `isWrongChain`. Don't import wagmi or wallet-sdk-react hooks in feature code.
2. **SDK first.** Use `@sodax/dapp-kit` hooks (`useLeverageYield*`) and `useSodaxContext().sodax`. The REST API
   (`useLeverageYieldApi*`, `sodax.api.leverageYield`) is the optional second path; use it only when asked to.
3. **Never add or upgrade `@sodax/*` packages.** They're pinned to `2.2.0-rc.8` and already installed.
   `pnpm add @sodax/...` would install `latest` (2.1.0), which lacks parts of this API. `pnpm check` fails if that
   happens.
4. **Styling:** Tailwind with the semantic tokens only (`bg-primary`, `text-muted-foreground`, `bg-card`,
   `border`, `rounded-lg`, `font-display`, …). Never hardcode hex colours or fonts in components; they live in
   `src/brand/theme.css`. Buttons are pill-shaped (`Button` already is).
5. **Units:** amounts are `bigint` in smallest units. lsoda* shares are 18 decimals. APRs are RAY (1e27 = 100%),
   leverage and health factor are WAD (1e18), LTV is basis points. Use the helpers in `src/lib/format.ts`.
6. **Polling:** don't poll faster than `REFETCH_MS`. A whole room shares one IP and the same public RPCs.
7. Keep feature code inside `src/features/leverage-yield/`. Run `pnpm check` before you say you're done.

## Source of truth, in order

1. The installed type definitions: `node_modules/@sodax/{sdk,dapp-kit,types}/dist/index.d.ts`.
2. The workshop skill: [`.agents/skills/sodax-leverage-yield/SKILL.md`](.agents/skills/sodax-leverage-yield/SKILL.md)
   and its `references/` (milestones, API recipes). **Read it before building the feature.**
3. The official SODAX skills, version-matched, in `node_modules/@sodax/skills/skills/` (for example
   `sodax-dapp-kit/leverage-yield/SKILL.md`). Where they conflict with this repo's skill, this repo wins.
4. The `sodax-docs` MCP server / https://docs.sodax.com. It may describe a different SDK version.

## Brand and copy

The default look is SODAX's. When you touch visual design or user-facing copy and the app keeps SODAX branding,
query the `sodax-marketing` MCP server (configured in `.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`):
`sodax_get_design_tokens`, `sodax_get_voice_guardrails`, `sodax_get_logos`. For example, write "cross-network" (not
"cross-chain"), and say "solvers" (never "our solver"). Partners rebranding the app use their own guidelines instead
and change only `src/brand/`.

## Workshop

The feature is built in four milestones (see `docs/WORKSHOP.md` and
`.agents/skills/sodax-leverage-yield/references/milestones.md`). Reference builds live on branches
`checkpoint/m1` … `checkpoint/m4` and `solution`.

On `main` and the checkpoints, `LeverageYieldPage.tsx` shows `<NextPrompt next={N} />` (from
`@/components/workshop/NextPrompt`): the prompt the participant pastes next, read from `docs/WORKSHOP.md`. Keep it
at the top of the page. When you finish milestone N, set `next={N + 1}`, or `next="done"` after Milestone 4
(or after building the whole feature in one go).
