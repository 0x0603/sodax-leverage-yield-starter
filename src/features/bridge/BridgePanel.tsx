import {
  isUserRejectedError,
  useBridge,
  useBridgeAllowance,
  useBridgeApprove,
  useGetBridgeableAmount,
  useGetBridgeableTokens,
} from '@sodax/dapp-kit';
import { ChainKeys, type CreateBridgeIntentParams } from '@sodax/sdk';
import { ArrowDownUpIcon, CheckCircle2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits, isHex } from 'viem';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_TOKEN_KEY,
  getDepositTokens,
  getTokenByKey,
  REFETCH_MS,
  SOURCE_CHAINS,
  type SourceChainKey,
} from '@/config/workshop';
import { chainName } from '@/lib/chains';
import { formatTokenAmount, parseTokenAmount, shortenAddress } from '@/lib/format';
import { useEvmWallet } from '@/wallet';
import { spendable, useTokenBalances } from '../leverage-yield/balances';
import { describeError, type Step, setStep } from '../leverage-yield/flow';
import { ChainSelect, FieldLabel, formatUsd, StepList, TokenSelect } from '../leverage-yield/parts';
import { toUsd, useUsdPrice } from '../leverage-yield/vaults';

type Phase = 'form' | 'signing' | 'delivering' | 'done';

/** Delivery to the destination usually lands within minutes; after this we stop claiming it's imminent. */
const ARRIVAL_TIMEOUT_MS = 15 * 60_000;

function planSteps(src: SourceChainKey, dst: SourceChainKey, symbol: string, approve: boolean | undefined): Step[] {
  return [
    {
      id: 'approve',
      label: `Approve ${symbol}`,
      detail:
        approve === undefined
          ? 'Only if your allowance is short. Some tokens ask twice.'
          : approve
            ? undefined
            : 'Not needed.',
      state: approve === false ? 'skipped' : 'pending',
      chainKey: src,
    },
    { id: 'sign', label: `Sign the transfer on ${chainName(src)}`, state: 'pending', chainKey: src },
    { id: 'settle', label: 'Settle on Sonic', state: 'pending', chainKey: ChainKeys.SONIC_MAINNET },
    {
      id: 'arrive',
      label: `Arrive on ${chainName(dst)}`,
      detail: 'Usually a few minutes.',
      state: 'pending',
      chainKey: dst,
    },
  ];
}

const otherChain = (chainKey: SourceChainKey): SourceChainKey => SOURCE_CHAINS.find(c => c !== chainKey) ?? chainKey;

/** Move a token between networks directly through the SODAX hub (no swap, no solver). */
export function BridgePanel() {
  const [srcChain, setSrcChain] = useState<SourceChainKey>(SOURCE_CHAINS[0]);
  const [dstChain, setDstChain] = useState<SourceChainKey>(otherChain(SOURCE_CHAINS[0]));
  const [srcTokenAddress, setSrcTokenAddress] = useState(getTokenByKey(SOURCE_CHAINS[0], DEFAULT_TOKEN_KEY)?.address);
  const [dstTokenAddress, setDstTokenAddress] = useState<string>();
  const [amount, setAmount] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string>();
  const [arrival, setArrival] = useState<{ before: bigint; startedAt: number }>();

  const wallet = useEvmWallet(srcChain);
  const { address, walletProvider } = wallet;
  const priceOf = useUsdPrice();

  const srcTokens = useMemo(() => getDepositTokens(srcChain), [srcChain]);
  const srcToken = srcTokens.find(t => t.address === srcTokenAddress) ?? srcTokens[0];

  // Only tokens that share the source token's hub vault can be bridged to.
  const { data: bridgeable } = useGetBridgeableTokens({
    params: { from: srcChain, to: dstChain, token: srcToken?.address },
  });
  const dstTokens = bridgeable ?? [];
  const dstToken = dstTokens.find(t => t.address === dstTokenAddress) ?? dstTokens[0];

  const { balances: srcBalances } = useTokenBalances(srcChain, srcTokens, address);
  const srcBalance = srcToken ? srcBalances?.[srcToken.address] : undefined;
  const maxSpend = spendable(srcToken, srcBalance, srcChain);
  const dstList = useMemo(() => (dstToken ? [dstToken] : []), [dstToken]);
  const { balances: dstBalances } = useTokenBalances(dstChain, dstList, address);
  const dstBalance = dstToken ? dstBalances?.[dstToken.address] : undefined;

  const { data: limit } = useGetBridgeableAmount({
    params: { from: srcToken, to: dstToken },
    queryOptions: { refetchInterval: REFETCH_MS },
  });

  const inputAmount = srcToken ? parseTokenAmount(amount, srcToken.decimals) : undefined;
  const insufficient = inputAmount !== undefined && srcBalance !== undefined && inputAmount > maxSpend;
  // The limit is in its own decimals; compare in source-token units.
  const limitInSrc =
    limit && srcToken ? (limit.amount * 10n ** BigInt(srcToken.decimals)) / 10n ** BigInt(limit.decimals) : undefined;
  const overLimit = inputAmount !== undefined && limitInSrc !== undefined && inputAmount > limitInSrc;

  const params = useMemo<CreateBridgeIntentParams | undefined>(
    () =>
      address && srcToken && dstToken && inputAmount && inputAmount > 0n
        ? {
            srcChainKey: srcChain,
            srcAddress: address,
            srcToken: srcToken.address,
            amount: inputAmount,
            dstChainKey: dstChain,
            dstToken: dstToken.address,
            recipient: address,
          }
        : undefined,
    [address, srcToken, dstToken, inputAmount, srcChain, dstChain],
  );

  const { data: allowanceOk } = useBridgeAllowance({
    params: { payload: phase === 'form' ? params : undefined, walletProvider },
    queryOptions: { refetchInterval: REFETCH_MS },
  });
  const approvalPlanned = params ? (allowanceOk === undefined ? undefined : !allowanceOk) : undefined;

  const { mutateAsyncSafe: approve } = useBridgeApprove();
  const { mutateAsyncSafe: bridge } = useBridge();

  // Arrival: the destination balance grows. Bridge resolves on Sonic settlement, before delivery.
  useEffect(() => {
    if (phase !== 'delivering' || !arrival) return;
    if (dstBalance !== undefined && dstBalance > arrival.before) {
      setSteps(s => setStep(s, 'arrive', { state: 'done', detail: undefined }));
      setPhase('done');
      return;
    }
    const id = setTimeout(
      () =>
        setSteps(s =>
          setStep(s, 'arrive', {
            state: 'error',
            detail: `Not seen on ${chainName(dstChain)} yet. It's still in flight; check your wallet later.`,
          }),
        ),
      Math.max(0, arrival.startedAt + ARRIVAL_TIMEOUT_MS - Date.now()),
    );
    return () => clearTimeout(id);
  }, [phase, arrival, dstBalance, dstChain]);

  function changeSrc(chainKey: SourceChainKey) {
    setSrcChain(chainKey);
    if (chainKey === dstChain) setDstChain(otherChain(chainKey));
    const same = getDepositTokens(chainKey).find(t => t.symbol === srcToken?.symbol);
    setSrcTokenAddress((same ?? getTokenByKey(chainKey, DEFAULT_TOKEN_KEY))?.address);
    setDstTokenAddress(undefined);
  }

  function flip() {
    setSrcChain(dstChain);
    setDstChain(srcChain);
    setSrcTokenAddress(getDepositTokens(dstChain).find(t => t.symbol === srcToken?.symbol)?.address);
    setDstTokenAddress(undefined);
    setAmount('');
  }

  async function submit() {
    if (!params || !walletProvider || !srcToken || !dstToken) return;
    let current = planSteps(srcChain, dstChain, srcToken.symbol, approvalPlanned);
    const update = (id: string, patch: Partial<Step>) => {
      current = setStep(current, id, patch);
      setSteps(current);
    };
    const fail = (id: string, e: unknown) => {
      update(id, { state: 'error' });
      setError(describeError(e));
    };
    setSteps(current);
    setError(undefined);
    setPhase('signing');

    if (allowanceOk) {
      update('approve', { state: 'skipped', detail: 'Not needed.' });
    } else {
      update('approve', { state: 'active', detail: 'Confirm the approval in your wallet.' });
      const approval = await approve({ params, walletProvider });
      if (!approval.ok) {
        if (isUserRejectedError(approval.error)) return reset();
        return fail('approve', approval.error);
      }
      const hash = approval.value;
      if (isHex(hash)) {
        update('approve', { hash, detail: 'Waiting for confirmation…' });
        try {
          const receipt = await walletProvider.waitForTransactionReceipt(hash);
          if (receipt.status === 'reverted' || receipt.status === '0x0') return fail('approve', 'Approval reverted.');
        } catch (e) {
          return fail('approve', e);
        }
      }
      update('approve', { state: 'done', detail: undefined });
    }

    const before = dstBalance ?? 0n;
    update('sign', { state: 'active', detail: 'Confirm the transfer in your wallet.' });
    update('settle', { state: 'pending' });
    const result = await bridge({ params, walletProvider });
    if (!result.ok) {
      if (isUserRejectedError(result.error)) return reset();
      return fail('sign', result.error);
    }
    update('sign', { state: 'done', hash: result.value.srcChainTxHash, detail: undefined });
    update('settle', { state: 'done', hash: result.value.dstChainTxHash });
    update('arrive', { state: 'active' });
    setArrival({ before, startedAt: Date.now() });
    setPhase('delivering');
  }

  function reset() {
    setPhase('form');
    setSteps([]);
    setError(undefined);
    setArrival(undefined);
  }

  const amountUsd = toUsd(inputAmount, srcToken?.decimals ?? 18, priceOf(srcToken?.vault));
  const disabledReason = !srcToken
    ? 'Pick a token'
    : !dstToken
      ? `${srcToken.symbol} can't be bridged to ${chainName(dstChain)}`
      : !inputAmount
        ? 'Enter an amount'
        : insufficient
          ? `Insufficient ${srcToken.symbol}`
          : overLimit
            ? 'Above the bridgeable limit'
            : undefined;

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold">Bridge</h2>
        <p className="text-sm text-muted-foreground">
          Move a token to another network through the SODAX hub on Sonic. 1:1, no swap; you receive the same asset.
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-5">
        {phase === 'form' ? (
          <>
            <div className="flex flex-col gap-3 rounded-lg border bg-secondary/40 p-4">
              <FieldLabel
                aside={
                  address && srcToken ? (
                    <button
                      type="button"
                      className="normal-case tracking-normal hover:text-primary"
                      onClick={() => setAmount(formatUnits(maxSpend, srcToken.decimals))}
                    >
                      Balance {formatTokenAmount(srcBalance, srcToken.decimals)} {srcToken.symbol}
                      <span className="ml-1 font-semibold text-primary">Max</span>
                    </button>
                  ) : null
                }
              >
                From
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <ChainSelect label="Source network" value={srcChain} onChange={changeSrc} />
                <TokenSelect
                  label="Token"
                  tokens={srcTokens}
                  value={srcToken?.address}
                  onChange={a => {
                    setSrcTokenAddress(a);
                    setDstTokenAddress(undefined);
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="h-14 pr-24 text-2xl font-semibold tabular-nums"
                  aria-invalid={insufficient || overLimit}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {amountUsd !== undefined ? `≈ ${formatUsd(amountUsd)}` : srcToken?.symbol}
                </span>
              </div>
            </div>

            <div className="-my-6 flex justify-center">
              <Button
                size="icon"
                variant="outline"
                className="z-10 shadow-sm"
                onClick={flip}
                aria-label="Swap direction"
              >
                <ArrowDownUpIcon />
              </Button>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-secondary/40 p-4">
              <FieldLabel
                aside={
                  address && dstToken ? (
                    <span className="normal-case tracking-normal">
                      Balance {formatTokenAmount(dstBalance, dstToken.decimals)} {dstToken.symbol}
                    </span>
                  ) : null
                }
              >
                To
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <ChainSelect
                  label="Destination network"
                  value={dstChain}
                  chains={SOURCE_CHAINS.filter(c => c !== srcChain)}
                  onChange={c => {
                    setDstChain(c);
                    setDstTokenAddress(undefined);
                  }}
                />
                <TokenSelect label="Token" tokens={dstTokens} value={dstToken?.address} onChange={setDstTokenAddress} />
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {inputAmount ? formatTokenAmount(inputAmount, srcToken?.decimals ?? 18, 6) : '0'}{' '}
                <span className="text-base font-medium text-muted-foreground">{dstToken?.symbol ?? '–'}</span>
              </p>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium">{address ? `${shortenAddress(address)} (you)` : '–'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridgeable now</span>
                <span className="font-medium tabular-nums">
                  {limit ? `${formatTokenAmount(limit.amount, limit.decimals, 2)} ${srcToken?.symbol}` : '–'}
                </span>
              </div>
            </div>

            {params && (
              <div className="flex flex-col gap-2">
                <FieldLabel>What you'll sign</FieldLabel>
                <StepList steps={planSteps(srcChain, dstChain, srcToken?.symbol ?? '', approvalPlanned)} />
              </div>
            )}

            {!wallet.isConnected ? (
              <Button size="lg" onClick={wallet.connect}>
                Connect wallet
              </Button>
            ) : wallet.isWrongChain ? (
              <Button size="lg" onClick={wallet.switchChain}>
                Switch to {chainName(srcChain)}
              </Button>
            ) : (
              <Button size="lg" disabled={!!disabledReason} onClick={submit}>
                {disabledReason ?? `Bridge to ${chainName(dstChain)}`}
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm">
              Bridging{' '}
              <span className="font-semibold">
                {amount} {srcToken?.symbol}
              </span>{' '}
              from {chainName(srcChain)} to {chainName(dstChain)}.
            </p>
            <StepList steps={steps} />
            {error && <Callout variant="destructive">{error}</Callout>}
            {phase === 'done' && (
              <Callout variant="success" className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4" /> Arrived on {chainName(dstChain)}.
              </Callout>
            )}
            {phase !== 'signing' || error ? (
              <Button variant={phase === 'done' ? 'default' : 'outline'} onClick={reset}>
                {phase === 'done' ? 'New transfer' : error ? 'Back' : 'Start another transfer'}
              </Button>
            ) : null}
          </>
        )}
      </Card>
    </section>
  );
}
