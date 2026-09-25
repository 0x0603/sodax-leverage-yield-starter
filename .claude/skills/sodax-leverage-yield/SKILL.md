---
name: sodax-leverage-yield
description: Build the SODAX Leverage Yield feature (pooled ERC-4626 lsoda* vaults) in this React starter with @sodax/dapp-kit 2.2.0-rc.7. Use for any task about vaults, lsodaWEETH / lsodaWSTETH / lsodaJITOSOL / lsodaSUSDS, deposit or withdraw flows, vault APR / TVL / share price, a user's vault shares, or the workshop milestones M1–M4. Vaults only, never leverage positions.
license: MIT
---

# SODAX Leverage Yield: vault feature

Everything here was checked against the installed `@sodax/*@2.2.0-rc.7` types and the live mainnet solver/API.
Read [AGENTS.md](../../../AGENTS.md) first for repo rules. Milestone specs are in
[references/milestones.md](references/milestones.md), the REST API path in
[references/api-recipes.md](references/api-recipes.md).

**Vault or leverage position?** Vault. Always. Ignore every `useLeveragePosition*` / `openLeveragePosition` API.

## Mental model

```
User wallet (Base / Arbitrum / Sonic)            Sonic (SODAX hub)
───────────────────────────────────              ─────────────────────────────────────────
1. approve token (deposit only)
2. sign intent tx  ──────── relay ─────────────▶ intent registered
                                                 3. a solver fills: token → lsoda* shares
                                                 4. shares land in the user's HUB WALLET
```

- A **deposit** is an intent swap: any supported token on an EVM chain → the vault's lsoda* share token.
- A **withdraw** is the reverse swap: lsoda* shares → any supported token, delivered to any supported chain.
- **Shares never reach the user's wallet.** They sit in a SODAX *hub wallet* on Sonic, derived from
  (source chain, user address), so each source chain has its own. MetaMask won't show them; your UI must.
- **Withdraw from the chain you deposited from**: that's where the hub wallet holding the shares is derived.
- The vault address **is** the lsoda* share token address (on Sonic). Shares are always 18 decimals.

## The vaults

`sodax.leverageYield.listVaults()` returns (synchronously) 4 vaults: `{ name, vault, asset, borrowToken, lsdSource }`.

| name | underlying (`asset` on Sonic) | yield source |
|---|---|---|
| lsodaWEETH | weETH | EtherFi |
| lsodaWSTETH | wstETH | Lido |
| lsodaJITOSOL | JitoSOL | Jito |
| lsodaSUSDS | sUSDS | Sky |

The workshop default is **lsodaSUSDS**, paying with **USDC on Base** (also Arbitrum or Sonic). ~$5 is a good test.
The solver rejects deposits under about **$2** ("Input amount too low").

## API surface (dapp-kit, import from `@sodax/dapp-kit`)

| Need | Use | Notes |
|---|---|---|
| Vault list | `useSodaxContext().sodax.leverageYield.listVaults()` | No hook exists. Don't use `useLeverageYieldApiVaults` in SDK mode. |
| Headline APR | `useLeverageYieldEffectiveApr({ params: { vault } })` | Show `effectiveNetAprRay` (RAY). Show an "estimate" badge when `lsdApr.stale`. `netAprRay` is AAVE-only and often negative: don't headline it. `leverageMultiplierWad` = leverage. |
| TVL | `useLeverageYieldTotalAssets({ params: { vault } })` | bigint, 18 dp, in the underlying asset. |
| Share price | `useLeverageYieldPreviewRedeem({ params: { vault, shares: 10n ** 18n } })` | Underlying per 1 share. Also converts any share amount to underlying. |
| Vault health | `useLeverageYieldPosition({ params: { vault } })` | The **vault's** own AAVE position: `healthFactor` (WAD), `ltv` (bps). Not the user's. |
| User's shares | `useLeverageYieldShareBalances({ params: { vault, holders: [{ chainKey, address }] } })` | Returns an **array** of query results (one per holder); each `data` is `{ chainKey, holder, shares }`. `holder` is the hub wallet. Sum across `SOURCE_CHAINS` for a total. |
| Token balance | `useBalances({ params: { chainKey, tokens: [token], address } })` | `data[token.address]` → bigint. |
| Quote | `useLeverageYieldQuote({ params: { payload } })` | `data` is an SDK **Result**: check `data.ok`, read `data.value.quoted_amount`. Payload below. |
| Build deposit | `useLeverageYieldDeposit()` → `mutateAsyncSafe(params)` | Builder only. Returns `Result<payload>`. |
| Build withdraw | `useLeverageYieldWithdraw()` → `mutateAsyncSafe(params)` | Builder only. Payload has `hubWalletSwap: true`. |
| Execute | `useLeverageYieldVaultSwap()` → `mutateAsyncSafe({ ...payload, walletProvider })` | Signs, submits, waits for the solver. Resolves **after the fill** (can take 1–2 min). |
| Approval (deposit) | `sodax.swaps.isAllowanceValid({ params: payload.params, raw: false, walletProvider })`, `useSwapApprove()` | Swap-domain hooks. There is no leverage-yield approve hook. Withdraw needs no approval. |
| Live status | `useLeverageYieldDetailedStatus({ params: { srcChainKey, srcTxHash } })` | Polls 3 s. `data.value.source === 'backend'` → `data.status` is `pending → relaying → relayed → posting_execution → posted_execution → solved \| failed`. |
| Errors | `isUserRejectedError(e)` | Mutations via `mutateAsyncSafe` return `{ ok, value \| error }`. |

Wallet: `useEvmWallet(chainKey)` from `@/wallet` gives `walletProvider` (an `IEvmWalletProvider`) for that chain.

Helpers already in the repo: `getDepositTokens(chainKey)`, `getTokenByKey(chainKey, 'USDC')`, `SOURCE_CHAINS`,
`DEFAULT_*`, `REFETCH_MS`, `MAX_SLIPPAGE_BPS` (`@/config/workshop`); `formatTokenAmount`, `parseTokenAmount`,
`formatRayPercent`, `formatWad`, `formatBps`, `minAmountAfterSlippage`, `ONE_SHARE` (`@/lib/format`);
`chainName`, `chainLogo`, `explorerTxUrl`, `explorerAddressUrl` (`@/lib/chains`).

## Quote payloads (exact)

```ts
import { ChainKeys } from '@sodax/types';

// Deposit: token on the source chain → vault shares on Sonic
const depositQuote = {
  token_src: token.address,
  token_src_blockchain_id: srcChainKey,        // e.g. ChainKeys.BASE_MAINNET
  token_dst: vault.vault,                      // the vault address is the share token
  token_dst_blockchain_id: ChainKeys.SONIC_MAINNET,
  amount: inputAmount,                         // bigint, token decimals
  quote_type: 'exact_input' as const,
};

// Withdraw: vault shares on Sonic → token on the destination chain
const withdrawQuote = {
  token_src: vault.vault,
  token_src_blockchain_id: ChainKeys.SONIC_MAINNET, // NOT the chain the user signs on (solver rejects it)
  token_dst: outputToken.address,
  token_dst_blockchain_id: dstChainKey,
  amount: shares,                              // bigint, 18 dp
  quote_type: 'exact_input' as const,
};
```

Then `minOutputAmount = minAmountAfterSlippage(quoted_amount, slippageBps)`.

## Deposit flow (the order matters)

1. On confirm (not earlier), **build** with `useLeverageYieldDeposit`:
   `{ vault: vault.vault, srcChainKey, srcAddress, inputToken: token.address, inputAmount, minOutputAmount }`.
   The payload's deadline is only ~5 minutes (hub block time), so a payload built when the form rendered can expire.
2. **Allowance:** `sodax.swaps.isAllowanceValid({ params: payload.params, raw: false, walletProvider })`. If false,
   `useSwapApprove().mutateAsyncSafe({ params: payload.params, walletProvider })`, then
   `await walletProvider.waitForTransactionReceipt(hash)` before continuing. Native tokens (ETH, S) need no approval.
3. **Execute:** `useLeverageYieldVaultSwap().mutateAsyncSafe({ ...payload, walletProvider })`.
4. Show progress. `vaultSwap` only resolves after the fill. To show the tx link as soon as the user signs, wrap the
   provider with `withTxListener(walletProvider, hash => …)` (see `references/milestones.md`, M2) and poll
   `useLeverageYieldDetailedStatus` with that hash.
5. On success, `result.value.intentDeliveryInfo` has `srcTxHash` (source chain) and `dstTxHash` (Sonic).

## Withdraw flow

Build with `useLeverageYieldWithdraw`:
`{ vault: vault.vault, srcChainKey /* chain the shares are held under */, srcAddress, dstChainKey, outputToken,
inputAmount: shares, minOutputAmount }`, then `vaultSwap({ ...payload, walletProvider })`. No approval: the user signs
one message tx on `srcChainKey` that lets the hub wallet spend its shares.

## Gotchas (each one has bitten someone)

1. `deposit()` / `withdraw()` **build**; nothing is sent until `vaultSwap`.
2. Quote with `useLeverageYieldQuote`, not `useQuote`: they deduct different fees. Don't call `adjustAmountByFee` on
   top.
3. `useLeverageYieldQuote().data` is a `Result`, unlike the other read hooks: check `.ok`.
4. **NO_PATH** (solver error code `-4`) is often transient while solvers rebalance: retry after a couple of seconds and
   show "No route right now".
5. Token pickers: use `getDepositTokens(chainKey)`. Sonic's SDK config also lists SODAX hub-internal tokens whose
   *symbols* look like real assets (its hub weETH has symbol `weETH`) and the lsoda* share tokens. Never offer those.
6. Underlying symbol: look up `vault.asset` in `spokeChainConfig[ChainKeys.SONIC_MAINNET].supportedTokens` (don't
   parse the LSD label: Lido's says "stETH" but the asset is wstETH).
7. `useLeverageYieldShareBalances` returns an array; read `[i].data?.shares`.
8. Shares can't be pulled out by SODAX's recovery tools. The only exit is a withdraw.
9. Simulation failures ("Simulation completed" revert) mean the tx would fail on-chain, usually from a missing
   balance, allowance or shares. The SDK simulates before asking the wallet to sign.
10. The wallet must be on the source chain: check `isWrongChain` and offer `switchChain()` before any signature.
11. Show risk clearly: real funds, hub-wallet custody, withdraw from the same chain, leveraged vault (the APR can go
    negative, the share price can fall; health factor is ~1.2).

## Copy

Use "solvers" (not "our solver"), "cross-network" (not "cross-chain"), "network" for chains in UI text. Avoid hype.
Never state a fee rate. `sodax-marketing` MCP → `sodax_get_voice_guardrails` has the full list.

## Deeper reference (version-matched)

- `node_modules/@sodax/skills/skills/sodax-dapp-kit/leverage-yield/SKILL.md` and
  `node_modules/@sodax/skills/skills/sodax-dapp-kit/integration/knowledge/recipes/leverage-yield.md`
- `node_modules/@sodax/skills/skills/sodax-sdk/leverage-yield/` and `.../leverage-yield-api/`

This skill overrides them where they differ: their examples use `minOutputAmount: 0n` placeholders and a sample
partner fee (never copy either), and one says recovery covers lsoda* shares (it doesn't).
