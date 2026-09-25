# REST API path (optional)

The same vaults through SODAX's keyless REST API, for partners who'd rather have a backend-style integration.
Base URL: `https://api.sodax.com/v1/leverage-yield` (no API key). Amounts are decimal **strings**.

In this app use the typed client instead of raw `fetch`: `useSodaxContext().sodax.api.leverageYield.*` (returns
`Result`) or the `useLeverageYieldApi*` hooks from `@sodax/dapp-kit`. The `solution` branch implements everything
below in `src/features/leverage-yield/api/`.

## Reads

| Route | Client method / hook | Returns |
|---|---|---|
| `GET /vaults` | `getVaults()` / `useLeverageYieldApiVaults` | vault descriptors (same shape as `listVaults()`) |
| `GET /apr/effective?vault=` | `getEffectiveApr({ vault })` / `useLeverageYieldApiEffectiveApr` | `{ effectiveNetAprRay, leverageMultiplierWad, lsdApr: { stale, … }, … }` |
| `GET /total-assets?vault=` | `getTotalAssets` / `useLeverageYieldApiTotalAssets` | `{ totalAssets }` |
| `GET /preview/redeem?vault=&shares=` | `previewRedeem` / `useLeverageYieldApiPreviewRedeem` | `{ assets }` |
| `GET /position?vault=` | `getPosition` / `useLeverageYieldApiPosition` | `{ collateral, debt, ltv, healthFactor, idleAsset }` |
| `GET /share-balance?vault=&owner=` | `getShareBalance` / `useLeverageYieldApiShareBalance` | `{ balance }` |

`owner` is the **hub wallet**, not the EOA. There's no API route to derive it; use
`sodax.hubProvider.getUserHubWalletAddress(address, chainKey)` (or `useGetUserHubWalletAddress`).

## Quotes

```ts
// POST /quote/deposit  → { quotedAmount }
useLeverageYieldApiDepositQuote({ params: { body: {
  vault: vault.vault, tokenSrc: token.address, tokenSrcChainKey: srcChainKey,
  amount: inputAmount.toString(), quoteType: 'exact_input',
} } });

// POST /quote/withdraw → { quotedAmount }
useLeverageYieldApiWithdrawQuote({ params: { body: {
  vault: vault.vault, srcChainKey /* the signing chain; the API takes it, unlike the SDK quote */,
  tokenDst: outputToken.address, tokenDstChainKey: dstChainKey,
  amount: shares.toString(), quoteType: 'exact_input',
} } });
```

Hook errors come back on `query.error`; the data is `{ quotedAmount }` directly (no Result wrapper).

## Deposit

```ts
const body = { vault, srcChainKey, srcAddress, inputToken, inputAmount: amount.toString(),
               minOutputAmount: minShares.toString() };

// 1. Allowance: POST /allowance/check → { valid }
const allowance = await sodax.api.leverageYield.checkAllowance(body);
// 2. If !valid: the hook asks the API for the approval tx(s), has the wallet sign, broadcasts and waits.
await approveAndBroadcast({ body, walletProvider });           // useLeverageYieldApiApproveAndBroadcast
// 3. POST /intents/deposit → { tx, intent, relayData }  (unsigned)
const created = await createDepositIntent({ body });            // useLeverageYieldApiCreateDepositIntent
// 4. The user signs + broadcasts on the source chain
const txHash = await walletProvider.sendTransaction(created.value.tx as EvmRawTransaction, {
  expectedChainId: getEvmViemChain(srcChainKey).id,             // from @sodax/sdk
});
// 5. POST /submit-tx: the API relays to Sonic and notifies solvers
await submitTx({ request: {                                     // useLeverageYieldApiSubmitTx
  txHash, srcChainKey, walletAddress: srcAddress,
  intent: toIntentRequest(created.value.intent),                // string → bigint fields, see below
  relayData: created.value.relayData.payload,
  operation: 'deposit',
} });
// 6. Poll GET /submit-tx/status?txHash=&srcChainKey= until data.status === 'solved' (or 'failed' / abandonedAt)
await sodax.api.leverageYield.getSubmitTxStatus({ txHash, srcChainKey });
```

```ts
function toIntentRequest(intent: IntentResponseV2): IntentRequestV2 {
  return { ...intent, intentId: BigInt(intent.intentId), inputAmount: BigInt(intent.inputAmount),
    minOutputAmount: BigInt(intent.minOutputAmount), deadline: BigInt(intent.deadline),
    srcChain: BigInt(intent.srcChain), dstChain: BigInt(intent.dstChain) };
}
```

## Withdraw

Same as deposit steps 3–6 with `useLeverageYieldApiCreateWithdrawIntent` and
`body = { vault, srcChainKey, srcAddress, dstChainKey, outputToken, inputAmount: shares.toString(),
minOutputAmount }`, `operation: 'withdraw'`. No allowance or approval.

## Same rules as the SDK path

Never send `minOutputAmount: "0"`, keep slippage ≤ `MAX_SLIPPAGE_BPS`, and let the user sign in their own wallet.
The API never holds keys; it only builds unsigned transactions.
