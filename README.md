# SODAX Leverage Yield starter

A whitelabel React starter for building **SODAX Leverage Yield** (pooled ERC-4626 `lsoda*` vaults) with a coding
agent. Wallet connection, the SODAX SDK and a themeable UI kit are wired up; you (or your agent) build the vault
feature.

- **Stack:** Vite 7, React 19, TypeScript, Tailwind v4, `@sodax/sdk` + `@sodax/dapp-kit` + `@sodax/wallet-sdk-react`
  (all `2.2.0-rc.8`)
- **Wallets:** EVM (browser extensions via EIP-6963; WalletConnect optional)
- **Network:** mainnet only. Deposits use **real funds**.
- **Keys:** none needed. The SDK and the REST API are keyless.

> Taking part in the workshop? Start with [docs/WORKSHOP.md](docs/WORKSHOP.md).
>
> See the finished app (branch `solution`) live at **<https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app>**.

## Quick start

Requires **Node.js ≥ 22.12** and pnpm (`corepack enable`).

```bash
git clone https://github.com/gosodax/sodax-leverage-yield-starter.git
cd sodax-leverage-yield-starter
pnpm install
pnpm dev
```

Open http://localhost:5173 and click **Connect wallet**.

Use `git clone` (or tick "Include all branches" when using the template) so you get the checkpoint branches.

## Build the feature with your agent

The repo gives your agent no SODAX-specific help beyond [`AGENTS.md`](AGENTS.md) (what this repo is, where the
feature goes, the real-funds rules; `CLAUDE.md` imports it). Everything about the SDK comes from SODAX itself: point
your agent at the [SODAX AI integration guide](https://docs.sodax.com/ai-integration-guide), which sets up the
official SODAX skills and MCP. Then ask it, for example:

```
Build the SODAX Leverage Yield vault feature with a nice, polished UI. Use https://docs.sodax.com/ai-integration-guide.
```

The workshop guide ([`docs/WORKSHOP.md`](docs/WORKSHOP.md)) has that prompt plus a milestone-by-milestone version.

## Branches

| Branch | Contents |
|---|---|
| `main` | The starter: wallet + SDK wired, and the prompts where the feature goes (all at once, or Milestone 1) |
| `checkpoint/m1` | + deposit form with live quote |
| `checkpoint/m2` | + execute deposit, stepper, "Your position" |
| `checkpoint/m3` | + vault browser |
| `checkpoint/m4` | + withdraw |
| `solution` | Complete reference build with a polished UX (vault list → deposit/withdraw modal, USD values, "Your vaults" across networks), plus an SDK/API transport toggle. Live at <https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app> |

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Dev server on :5173 |
| `pnpm check` | Typecheck, lint, `@sodax/*` version guard, display-format guard |
| `pnpm build` | Production build to `dist/` |
| `pnpm preflight` | Read-only health check: SODAX API, RPCs, vault reads, deposit quote matrix and minimum amount |

## Project structure

```
src/
  features/leverage-yield/   ← build the vault feature here
  wallet/                    useEvmWallet(), connect modal, account menu
  config/                    workshop.ts (defaults you may tune); rpc/sodax/wallet wiring (leave as is)
  brand/                     theme.css + brand.config.ts: the whitelabel surface
  components/ui/             Button, Card, Dialog, Select, Input, Badge, Callout, Skeleton, Tooltip
  lib/                       unit/format helpers, chain + explorer helpers
scripts/                     preflight and guard scripts
docs/WORKSHOP.md             workshop guide for participants
```

## Make it yours (whitelabel)

All brand decisions live in three places:

1. **`src/brand/theme.css`**: colours, fonts, radius as CSS variables. Components only use semantic Tailwind
   classes (`bg-primary`, `text-muted-foreground`, …), so changing a variable restyles the whole app.
2. **`src/brand/brand.config.ts`**: app name, tagline, logo paths, links, and the "Powered by SODAX" credit.
3. **`public/brand/`**: logo and favicon files.

The defaults are SODAX's brand tokens. Or just ask
your agent: *"Rebrand this app for Acme using acme.com's colours. Only touch src/brand and public/brand."*

## Configuration

Everything is optional; copy `.env.example` to `.env.local` to override:

- `VITE_WALLETCONNECT_PROJECT_ID`: enables WalletConnect (QR/mobile wallets).
- `VITE_<CHAIN>_RPC_URL`: RPC overrides (defaults are public endpoints).
- `VITE_BASE_PATH`: base path for sub-path deployments.

## Safety

This app moves real money. The guardrails in `AGENTS.md` (never `minOutputAmount: 0`, slippage ≤ 3%, no key
handling, a risk notice before signing) apply to anything you build on it. Vault deposits carry smart contract and
market risk: the vaults are leveraged, the APR is variable and can turn negative, and the share price can fall.

## License

MIT
