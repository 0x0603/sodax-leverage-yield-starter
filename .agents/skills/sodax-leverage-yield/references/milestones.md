# Milestones

Build in order. Each milestone is small enough for one agent session (~10–15 min). All code goes in
`src/features/leverage-yield/`. Reference builds: branches `checkpoint/m1` … `checkpoint/m4` (and `solution`).
Run `pnpm check` at the end of each milestone.

Suggested structure (the reference builds use it):

```
src/features/leverage-yield/
  LeverageYieldPage.tsx         mount point (already rendered by App.tsx)
  components/                   DepositForm, DepositDialog, PositionCard, VaultCard, WithdrawDialog, …
  hooks/                        useVaults, useDepositQuote, useVaultDeposit, …
  lib/                          vaults.ts (display helpers), errors.ts, withTxListener.ts
```

---

## M1: Deposit form with a live quote

**Goal:** a card where the user picks a vault, a source network and a token, types an amount and sees a live quote.
Nothing is signed yet.

Build:

1. `useVaults()` → `useSodaxContext().sodax.leverageYield.listVaults()` (memoised). Default vault
   `DEFAULT_VAULT_NAME` (lsodaSUSDS).
2. Vault picker (the `Select` primitive) showing each vault's name, underlying symbol and headline APR
   (`useLeverageYieldEffectiveApr` → `formatRayPercent(effectiveNetAprRay)`; "estimate" badge if `lsdApr.stale`).
3. Network picker over `SOURCE_CHAINS` (logo + name via `chainLogo` / `chainName`). Default: the wallet's
   `currentChainKey` if it's in `SOURCE_CHAINS`, else `DEFAULT_SOURCE_CHAIN` (Base).
4. Token picker over `getDepositTokens(chainKey)`, default `getTokenByKey(chainKey, 'USDC')`. Reset it when the
   network changes.
5. Amount input: `parseTokenAmount(text, token.decimals)` (returns `undefined` when invalid). Show the wallet
   balance (`useBalances`) and a Max button (hide Max for native ETH/S; they need gas).
6. Debounced (~400 ms) quote with `useLeverageYieldQuote` (payload in SKILL.md). Show expected shares, their value
   in the underlying (`useLeverageYieldPreviewRedeem({ vault, shares })`), minimum received
   (`minAmountAfterSlippage(shares, DEFAULT_SLIPPAGE_BPS)`) and slippage.
7. Quote errors: show the message and a Retry button. Auto-retry NO_PATH (`error.detail.code === -4`) once after
   ~2 s. Map "amount too low" to "Try at least ~$2".
8. A risk notice: real funds; shares are held in the SODAX hub wallet on Sonic, not the wallet app; withdraw from
   the same network; leveraged vault (the APR can change or go negative, the share price can fall).
9. One primary button driven by a state machine:
   `Connect wallet` → `Switch to <network>` → `Enter an amount` → `Insufficient <token>` → `Getting quote…` →
   `No quote` → `Review deposit` (disabled in M1; M2 wires it).

**Pass check:** 5 USDC on Base → lsodaSUSDS shows ≈ 4.5 shares expected, with a minimum received below it.

```tsx
// Quote hook core (reference: hooks/useDepositQuote.ts)
const debounced = useDebouncedValue(inputAmount);
const payload = vault && token && debounced ? {
  token_src: token.address, token_src_blockchain_id: srcChainKey,
  token_dst: vault.vault, token_dst_blockchain_id: ChainKeys.SONIC_MAINNET,
  amount: debounced, quote_type: 'exact_input' as const,
} : undefined;
const { data: result } = useLeverageYieldQuote({ params: { payload }, queryOptions: { refetchInterval: REFETCH_MS } });
const shares = result?.ok ? result.value.quoted_amount : undefined;
const minShares = shares !== undefined ? minAmountAfterSlippage(shares, DEFAULT_SLIPPAGE_BPS) : undefined;
```

---

## M2: Execute the deposit and show the user's shares (the payoff)

**Goal:** a real deposit completes and the user's shares show up in the app.

Build:

1. `Review deposit` opens a dialog with the quote summary and a `Confirm deposit` button.
2. On confirm, run the deposit flow from SKILL.md: **build at confirm time** → allowance → approve and wait for the
   receipt if needed → `vaultSwap({ ...payload, walletProvider })`. Use `mutateAsyncSafe` and branch on `.ok`.
3. A stepper: `Approve <token>` (or "not needed") → `Confirm the deposit in your wallet` → `Delivering to Sonic` →
   `Solver fills; shares arrive in your hub wallet`. Link every tx hash to its explorer (`explorerTxUrl`).
4. Capture the source tx hash when the user signs (`withTxListener`, below) and drive the last two steps from
   `useLeverageYieldDetailedStatus({ params: { srcChainKey, srcTxHash } })`.
5. Don't let the dialog close while a transaction is in flight. On error, show a friendly message
   (`isUserRejectedError` → "You rejected the request"); offer Try again only if nothing was sent yet.
6. A "Your position" card for the selected vault and network:
   `useLeverageYieldShareBalances({ params: { vault, holders: [{ chainKey, address }] } })[0].data` →
   shares, value in underlying (`useLeverageYieldPreviewRedeem`), and the hub wallet address (`holder`) linked to
   sonicscan, with a note that it won't appear in the wallet app.

**Pass check:** a real ~$5 deposit fills and "Your position" shows the new shares (it refreshes every
`REFETCH_MS`).

```ts
// Learn the tx hash the moment the user signs (reference: lib/withTxListener.ts)
export function withTxListener(walletProvider: IEvmWalletProvider, onTx: (hash: string) => void): IEvmWalletProvider {
  return new Proxy(walletProvider, {
    get(target, prop, receiver) {
      if (prop === 'sendTransaction') {
        return async (...args: Parameters<IEvmWalletProvider['sendTransaction']>) => {
          const hash = await target.sendTransaction(...args);
          onTx(hash);
          return hash;
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

// Deposit flow core (reference: hooks/useVaultDeposit.ts)
const built = await buildDeposit({ vault: vault.vault, srcChainKey, srcAddress, inputToken: token.address,
  inputAmount, minOutputAmount: minShares });
if (!built.ok) return fail(built.error);
const allowance = await sodax.swaps.isAllowanceValid({ params: built.value.params, raw: false, walletProvider });
if (!allowance.ok) return fail(allowance.error);
if (!allowance.value) {
  const approved = await approve({ params: built.value.params, walletProvider });
  if (!approved.ok) return fail(approved.error);
  await walletProvider.waitForTransactionReceipt(approved.value as `0x${string}`);
}
const result = await vaultSwap({ ...built.value, walletProvider: withTxListener(walletProvider, setSrcTxHash) });
```

---

## M3: Vault browser

**Goal:** a grid of all vaults with live stats, so users can compare before depositing.

Build a card per vault (`listVaults()`) with:

- Underlying symbol (from `vault.asset`, see SKILL.md gotcha 6) and yield source (`lsdSource.label`).
- Net APR (`effectiveNetAprRay`) with a tooltip explaining it, and an "APR estimate" badge when `lsdApr.stale`.
- TVL: `useLeverageYieldTotalAssets` (18 dp, underlying units).
- Share price: `useLeverageYieldPreviewRedeem({ vault, shares: ONE_SHARE })`.
- Leverage: `formatWad(apr.leverageMultiplierWad)`×; health / LTV: `useLeverageYieldPosition` →
  `formatWad(healthFactor)` / `formatBps(ltv)`.
- When connected, "You hold": the sum of `useLeverageYieldShareBalances` over
  `SOURCE_CHAINS.map(chainKey => ({ chainKey, address }))`.
- A Deposit button that selects the vault in the deposit form (lift the selected vault to the page) and scrolls to it.

Skeletons while loading; an unavailable APR renders "–" instead of breaking the card.

**Pass check:** all 4 vaults show live APR, TVL, share price, leverage and health.

---

## M4: Withdraw

**Goal:** users can exit to a token and network of their choice.

Build:

1. A Withdraw button on "Your position" (only when shares > 0). It opens a dialog for **that vault and that source
   network**; the user signs on that network.
2. Inputs: shares (with Max = full balance), "Receive on" network (`SOURCE_CHAINS`, default the same network) and
   token (`getDepositTokens(dstChainKey)`, default USDC).
3. Quote with `useLeverageYieldQuote` using the **withdraw** payload from SKILL.md (`token_src = vault` on Sonic).
   Show you receive and the minimum received.
4. `useLeverageYieldWithdraw` → `vaultSwap({ ...payload, walletProvider })`. No approval step. Reuse the stepper:
   `Authorise the withdrawal in your wallet` → `Delivering to Sonic` → `Solver sends <token> to <network>`.
5. If the wallet is on the wrong network, show `Switch to <network>` first.

**Pass check:** the withdraw quote shows a sensible amount (≈ the deposit, minus spread). Optional: withdraw for real
and see the token arrive.

---

## Stretch (see branch `solution`)

- An SDK/API toggle that runs every read, quote and transaction through the keyless REST API
  ([api-recipes.md](api-recipes.md)).
- Slippage selector (≤ `MAX_SLIPPAGE_BPS`), transaction history, positions across all chains in one view.
- Rebrand: ask your agent to restyle `src/brand/theme.css` and `brand.config.ts` to your company's brand.
