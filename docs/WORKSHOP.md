# Workshop: build SODAX Leverage Yield with a coding agent

In about an hour you'll use a coding agent (Claude Code, Codex, Cursor, …) to add pooled vault deposits to a React
app, then make a real deposit into a SODAX vault. You leave with a working vault app and vault shares of your own.

The finished app is live at **<https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app>** (branch `solution`). Use it to compare with yours, or to see
your shares and withdraw if your own build breaks. The build after each milestone is live too (see §4).

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
| 0:17 | **M2** Execute deposit + shares | Paste prompt M2, then make a real ~$5 deposit. Check: your new shares show. |
| 0:32 | **M3** Vault browser | Paste prompt M3. Check: 4 vault cards with live APR / TVL. |
| 0:42 | **M4** Withdraw | Paste prompt M4. Check: withdraw quote. Optional: withdraw for real. |
| 0:54 | Wrap (6 min) | The finished [solution](https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app) (list + modal UX, SDK/API toggle), rebranding with one prompt, the SODAX docs for agents, Q&A. |

**Two ways to build it.** With a capable agent (Claude Opus 5.5, Codex Sol 6 or similar), paste the **All at once**
prompt (§3) instead of M1–M4, then walk through its checks. Go milestone by milestone if you use a lighter
model or want to see each step come together; each prompt is small enough for one short session.

Falling behind? M2 is the one that matters. Switch to `checkpoint/m2` (see §4) so you can still deposit.

## 3. Prompts

The app shows the next prompt at the top of the page, with a Copy button. They are also here, to paste as-is into
any agent. The repo gives your agent no SODAX-specific help: the prompts send it to the
[SODAX AI integration guide](https://docs.sodax.com/ai-integration-guide).

With a capable agent, one prompt builds the whole app. Check: a live deposit quote, a real ~$5 deposit that shows your
shares, every vault with live APR / TVL, and a withdraw quote.

**All at once**

```
Build the SODAX Leverage Yield vault feature with a nice, polished UI: browse the vaults, deposit from any supported
network and token, see my shares and withdraw. Use https://docs.sodax.com/ai-integration-guide as your guide.
```

Or step by step:

**M1**

```
Using https://docs.sodax.com/ai-integration-guide, add a deposit form for the SODAX Leverage Yield vaults: pick a
vault, a source network and token, enter an amount, and show a live quote of the vault shares I'd get and the
minimum I'd accept. Don't send anything yet. Then tell me how to verify it in the browser.
```

**M2**

```
Make the deposit work: when I confirm, ask my wallet for approval if needed, submit the deposit, show each step's
progress with explorer links, and show my vault shares once it fills.
```

**M3**

```
Add a vault browser: a card per vault with live APR, TVL, share price, leverage and health, plus my shares in it.
Its Deposit button selects that vault in the deposit form.
```

**M4**

```
Add withdraw: from the shares I hold, quote and withdraw back to a token on a network I choose, with the same
progress steps.
```

**Bonus: rebrand**

```
Rebrand this app for <Company> using <brand site or colours>. Only change src/brand/theme.css,
src/brand/brand.config.ts and the files in public/brand/. Keep contrast accessible.
```

## 4. Catch-up

Each milestone has a reference branch, and each branch is live, so you can see what you're aiming for before you
build it:

| Branch | What's in it | Live |
|---|---|---|
| `checkpoint/m1` | M1: deposit form + live quote | <https://sodax-leverage-yield-starter-git-checkpoint-m1-icon-foundation.vercel.app> |
| `checkpoint/m2` | M1 + M2: execute deposit + shares | <https://sodax-leverage-yield-starter-git-checkpoint-m2-icon-foundation.vercel.app> |
| `checkpoint/m3` | M1–M3: vault browser | <https://sodax-leverage-yield-starter-git-checkpoint-m3-icon-foundation.vercel.app> |
| `checkpoint/m4` | M1–M4: withdraw | <https://sodax-leverage-yield-starter-git-checkpoint-m4-icon-foundation.vercel.app> |
| `solution` | Everything, with a polished list + modal UX and the SDK/API toggle | <https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app> |

The prompt card at the top of the app links the builds still ahead of you. To continue from one locally:

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
app. Open the [hosted solution](https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app) (or switch to `solution`) to see them and withdraw.

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
| Deposit stuck on "Delivering to Sonic" / "Solver fills" | Usually under 2 minutes. Keep the dialog open; the tx link shows it's on-chain. If it's still pending after 5 minutes, check your position on the [hosted solution](https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app) and ask a facilitator. |
| "Where are my shares?" | In the SODAX hub wallet on Sonic, per source network, never in MetaMask. The "Your position" card shows them; "Your vaults" on the [hosted solution](https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app) lists every vault and network. |
| Agent built "leverage positions" | Wrong product. Revert, and tell it: "Vaults only; read AGENTS.md scope." |
| Agent doesn't know the SODAX SDK | Send it to <https://docs.sodax.com/ai-integration-guide>. |

## 6. How it works

- **What:** SODAX Leverage Yield vaults are pooled ERC-4626 vaults on Sonic. Each holds a liquid staking token
  (weETH, wstETH, JitoSOL, sUSDS), borrows against it and re-stakes up to a target LTV. That multiplies the
  staking yield, and the risk.
- **How a deposit works:** you sign one intent on your network (plus an approval the first time). SODAX delivers
  it to Sonic, and a solver fills it by delivering vault shares to your hub wallet.
- **Risks:** real funds; leveraged positions (health factor ~1.2); the APR is variable and can go negative; share
  price can fall; exit is only via withdraw.
- **API option:** everything the SDK does is also available via the keyless REST API at
  `https://api.sodax.com/v1/leverage-yield/*`. The `solution` branch ([live](https://sodax-leverage-yield-starter-git-solution-icon-foundation.vercel.app)) has a toggle to show both.
