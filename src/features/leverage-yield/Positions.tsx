import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderIcon } from '@/components/xp/icons';
import type { SourceChainKey } from '@/config/workshop';
import { chainName } from '@/lib/chains';
import { formatTokenAmount } from '@/lib/format';
import { ChainIcon, formatUsd, TokenBadge } from './parts';
import {
  SHARE_DECIMALS,
  shareValue,
  toUsd,
  useShareHoldings,
  useUsdPrice,
  useVaultStats,
  type VaultMeta,
} from './vaults';

/** "Your positions": every vault × network where the connected address holds shares. */
export function Positions({
  vaults,
  address,
  onWithdraw,
}: {
  vaults: VaultMeta[];
  address: string;
  onWithdraw: (meta: VaultMeta, chainKey: SourceChainKey) => void;
}) {
  const [values, setValues] = useState<Record<string, { usd: number; rows: number }>>({});
  const report = useCallback(
    (name: string, usd: number, rows: number) =>
      setValues(v => (Object.is(v[name]?.usd, usd) && v[name]?.rows === rows ? v : { ...v, [name]: { usd, rows } })),
    [],
  );
  const totalUsd = Object.values(values).reduce((sum, v) => sum + v.usd, 0);
  const hasAny = Object.values(values).some(v => v.rows > 0);

  return (
    <section id="positions" className="flex scroll-mt-4 flex-col gap-2">
      <h2 className="xp-section-title text-lg">My Positions</h2>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <p>Held in your SODAX hub wallet on Sonic, per source network.</p>
        {hasAny && (
          <p>
            Total value: <span className="font-bold text-foreground tabular-nums">{formatUsd(totalUsd)}</span>
          </p>
        )}
      </div>
      <div className="xp-sunken overflow-x-auto">
        <table className="xp-listview">
          <thead>
            <tr>
              <th>Name</th>
              <th>Network</th>
              <th className="text-right">Shares</th>
              <th className="text-right">Value</th>
              <th className="text-right">USD</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {vaults.map(meta => (
              <PositionRows
                key={meta.vault.name}
                meta={meta}
                address={address}
                onWithdraw={onWithdraw}
                report={report}
              />
            ))}
            {!hasAny && (
              <tr>
                <td colSpan={6} className="py-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <FolderIcon className="size-6" />
                    No vault shares yet. Pick a vault below to make your first deposit.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PositionRows({
  meta,
  address,
  onWithdraw,
  report,
}: {
  meta: VaultMeta;
  address: string;
  onWithdraw: (meta: VaultMeta, chainKey: SourceChainKey) => void;
  report: (name: string, usd: number, rows: number) => void;
}) {
  const holdings = useShareHoldings(meta.vault.vault, address);
  const { pricePerShare } = useVaultStats(meta.vault.vault);
  const price = useUsdPrice()(meta.vault.asset);

  const rows = holdings.rows.map(r => {
    const assets = pricePerShare !== undefined ? shareValue(r.shares, pricePerShare) : undefined;
    return { ...r, assets, usd: toUsd(assets, meta.assetDecimals, price) };
  });
  const usd = rows.reduce((sum, r) => sum + (r.usd ?? 0), 0);

  useEffect(() => report(meta.vault.name, usd, rows.length), [report, meta.vault.name, usd, rows.length]);

  return rows.map(r => (
    <tr key={r.chainKey}>
      <td>
        <span className="flex items-center gap-2">
          <TokenBadge symbol={meta.assetSymbol} className="size-6 text-[10px]" />
          <span className="font-bold">{meta.shareSymbol}</span>
        </span>
      </td>
      <td>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <ChainIcon chainKey={r.chainKey as SourceChainKey} />
          {chainName(r.chainKey)}
        </span>
      </td>
      <td className="text-right tabular-nums">{formatTokenAmount(r.shares, SHARE_DECIMALS)}</td>
      <td className="text-right whitespace-nowrap tabular-nums">
        {formatTokenAmount(r.assets, meta.assetDecimals)} {meta.assetSymbol}
      </td>
      <td className="text-right font-bold tabular-nums">{formatUsd(r.usd)}</td>
      <td className="text-right">
        <Button size="sm" variant="outline" onClick={() => onWithdraw(meta, r.chainKey as SourceChainKey)}>
          Withdraw…
        </Button>
      </td>
    </tr>
  ));
}
