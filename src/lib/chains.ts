import { baseChainInfo, type ChainKey } from '@sodax/types';

type ChainInfo = { name: string; logo: string; explorer?: { txUrl?: string; addressUrl?: string } };

function info(chainKey: ChainKey): ChainInfo | undefined {
  return (baseChainInfo as Record<string, ChainInfo>)[chainKey];
}

export function chainName(chainKey: ChainKey): string {
  return info(chainKey)?.name ?? chainKey;
}

export function chainLogo(chainKey: ChainKey): string | undefined {
  return info(chainKey)?.logo;
}

/** Block explorer link for a transaction hash on a chain (Sonic = sonicscan.org, Base = basescan.org, …). */
export function explorerTxUrl(chainKey: ChainKey, txHash: string): string | undefined {
  const base = info(chainKey)?.explorer?.txUrl;
  return base ? `${base}${txHash}` : undefined;
}

export function explorerAddressUrl(chainKey: ChainKey, address: string): string | undefined {
  const base = info(chainKey)?.explorer?.addressUrl;
  return base ? `${base}${address}` : undefined;
}
