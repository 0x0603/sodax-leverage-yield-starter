# Workshop: build SODAX Leverage Yield with a coding agent

In about an hour you'll use a coding agent (Claude Code, Codex, Cursor, …) to add pooled vault deposits to a React
app, then make a real deposit into a SODAX vault. You leave with a working vault app and vault shares of your own.

The finished app is live at **<https://sodax-leverage-yield-starter.vercel.app>** (branch `solution`). Use it to compare with yours, or to see your
shares and withdraw if your own build breaks.

> Real funds. There is no testnet vault. Use a fresh wallet you funded yourself and small amounts (~$5 per
> deposit).

---

## 1. Before you start

15 minutes, ideally at home rather than on venue Wi-Fi:

1. Install **Node.js 22.12 or newer** (`node -v`), then enable pnpm: `corepack enable`.
2. Install your coding agent (Claude Code, Codex, Cursor or similar) and sign in.
3. Create a **fresh EVM wallet** in one browser extension (MetaMask, Rabby or Hana). Don't use a Safe or other
   smart-contract wallet.
4. Fund it with **at least $10 of USDC plus ~$2 of ETH for gas on Base** (Arbitrum works too). You'll deposit ~$5
   and withdraw it again; gas is needed for the approval, the deposit and the withdrawal.
   *Fastest option:* USDC plus a little S on **Sonic** (no cross-network delivery step).
5. Clone and run the starter (the install is large, so do it now):
   ```bash
   git clone https://github.com/gosodax/sodax-leverage-yield-starter.git
   cd sodax-leverage-yield-starter
   pnpm install
   pnpm dev
   ```
   Open http://localhost:5173, click **Connect wallet**, and check that your address appears top right.

Use `git clone`. Don't use "Use this template" or fork (or tick "Include all branches" if you do): the catch-up
branches only come with a full clone.

## 2. Agenda

| Time | Block | What you do |
|---|---|---|
| 0:00 | Intro (5 min) | How the vaults work (see §6), the risks, where your shares live. Open the app and connect your wallet. |
| 0:05 | **M1** Deposit form + live quote | Paste prompt M1. Check: 5 USDC → ≈ 4.5 lsodaSUSDS quote. |
| 0:17 | **M2** Execute deposit + shares | Paste prompt M2, then make a real ~$5 deposit. Check: "Your position" shows shares. |
| 0:32 | **M3** Vault browser | Paste prompt M3. Check: 4 vault cards with live APR / TVL. |
| 0:42 | **M4** Withdraw | Paste prompt M4. Check: withdraw quote. Optional: withdraw for real. |
| 0:54 | Wrap (6 min) | The finished [solution](https://sodax-leverage-yield-starter.vercel.app) (list + modal UX, SDK/API toggle), rebranding with one prompt, docs and skills, Q&A. |

Falling behind? M2 is the one that matters. Switch to `checkpoint/m2` (see §4) so you can still deposit.

## 3. Prompts

The app shows the next prompt at the top of the page, with a Copy button. They are also here, to paste as-is into
any agent. Start each milestone in a fresh agent session: the repo's AGENTS.md and skill carry the context.

**M1**

```
Read AGENTS.md and .agents/skills/sodax-leverage-yield/SKILL.md. Then implement Milestone 1 (deposit form with
a live quote) from .agents/skills/sodax-leverage-yield/references/milestones.md in src/features/leverage-yield/.
Follow its build list and pass check exactly. Don't change providers, wallet wiring or config other than
src/config/workshop.ts. Run pnpm check, then tell me how to verify it in the browser.
```

**M2**

```
Implement Milestone 2 (execute the deposit and show my shares) from
.agents/skills/sodax-leverage-yield/references/milestones.md. Follow the deposit flow in SKILL.md exactly: build
the payload at confirm time, check allowance, approve and wait for the receipt if needed, then vaultSwap. Never use
0 as minOutputAmount. Add the stepper with explorer links and the "Your position" card. Run pnpm check.
```

**M3**

```
Implement Milestone 3 (vault browser) from .agents/skills/sodax-leverage-yield/references/milestones.md: a card
per vault with live APR, TVL, share price, leverage, health and my shares across SOURCE_CHAINS, plus a Deposit
button that selects the vault in the deposit form. Run pnpm check.
```

**M4**

```
Implement Milestone 4 (withdraw) from .agents/skills/sodax-leverage-yield/references/milestones.md. Use the
withdraw quote payload from SKILL.md (token_src is the vault on Sonic). No approval step. Open it from the
"Your position" card for the network the shares are held under. Run pnpm check.
```

**Bonus: rebrand**

```
Rebrand this app for <Company> using <brand site or colours>. Only change src/brand/theme.css,
src/brand/brand.config.ts and the files in public/brand/. Keep contrast accessible. Run pnpm check.
```

## 4. Catch-up

Branches: `checkpoint/m1` (M1 done), `checkpoint/m2` (M1 + M2), `checkpoint/m3`, `checkpoint/m4`, `solution`
(everything with a polished list + modal UX, plus the SDK/API toggle).

```bash
# From a clone (keeps your work in a stash)
git stash -u
git switch checkpoint/m2        # or m1 / m3 / m4 / solution
pnpm dev
```

```bash
# From a fork or template copy that lacks the branches
git stash -u
git fetch https://github.com/gosodax/sodax-leverage-yield-starter.git checkpoint/m2
git switch -c m2 FETCH_HEAD
```

Continue with the next milestone's prompt from there. The app shows it at the top of the page.

If your code breaks after you deposited, your shares are safe: they belong to your wallet and network, not to the
app. Open the [hosted solution](https://sodax-leverage-yield-starter.vercel.app) (or switch to `solution`) to see them and withdraw.

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| `pnpm install` very slow | It's a big dependency tree (wallet SDKs). Use a phone hotspot, or pair with someone who installed at home. |
| Blank page, console says "No QueryClient set" or shows two Reacts | An agent changed `vite.config.ts` / providers or added a package. `git checkout vite.config.ts src/providers.tsx package.json pnpm-lock.yaml && pnpm install`. |
| `pnpm check` fails in `check-versions`, or the footer doesn't say "SDK 2.2.0-rc.8" | An agent ran `pnpm add @sodax/...`. Restore `package.json` / `pnpm-lock.yaml` from git and `pnpm install`. |
| Wallet not listed | Install/unlock a browser wallet extension and reload. Only EVM wallets are supported. |
| Button says "Switch to Base" | The wallet is on another network. Click it and approve in the wallet. |
| "No route right now" | Solvers are rebalancing. It retries automatically; press Retry after a few seconds. |
| "Amount too low" | Deposit at least ~$2. |
| "Simulation reverted" | The tx would fail: not enough balance, gas or shares. Top up gas on the source network. |
| Deposit stuck on "Delivering to Sonic" / "Solver fills" | Usually under 2 minutes. Keep the dialog open; the tx link shows it's on-chain. If it's still pending after 5 minutes, check your position on the [hosted solution](https://sodax-leverage-yield-starter.vercel.app) and ask a facilitator. |
| "Where are my shares?" | In the SODAX hub wallet on Sonic, per source network, never in MetaMask. The "Your position" card shows them; "Your vaults" on the [hosted solution](https://sodax-leverage-yield-starter.vercel.app) lists every vault and network. |
| Agent built "leverage positions" | Wrong product. Revert, and tell it: "Vaults only; read AGENTS.md scope." |
| Codex doesn't see the MCP servers | Run `codex mcp add sodax-marketing --url https://marketing.sodax.com/mcp` (and `sodax-docs` with `https://docs.sodax.com/mcp`). |

## 6. How it works

- **What:** SODAX Leverage Yield vaults are pooled ERC-4626 vaults on Sonic. Each holds a liquid staking token
  (weETH, wstETH, JitoSOL, sUSDS), borrows against it and re-stakes up to a target LTV. That multiplies the
  staking yield, and the risk.
- **How a deposit works:** you sign one intent on your network (plus an approval the first time). SODAX delivers
  it to Sonic, and a solver fills it by delivering vault shares to your hub wallet.
- **Risks:** real funds; leveraged positions (health factor ~1.2); the APR is variable and can go negative; share
  price can fall; exit is only via withdraw.
- **API option:** everything the SDK does is also available via the keyless REST API at
  `https://api.sodax.com/v1/leverage-yield/*`. The `solution` branch ([live](https://sodax-leverage-yield-starter.vercel.app)) has a toggle to show both.
