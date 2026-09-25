import { ChainKeys, type EvmChainKey } from '@sodax/types';

/**
 * One RPC map shared by the SODAX SDK (`sodax.ts`) and the wallet connector (`wallet.ts`), so reads and
 * wallet calls hit the same endpoints. Public endpoints by default; override with VITE_*_RPC_URL.
 *
 * Takes the env explicitly so `scripts/preflight.ts` can pass the same VITE_* values (via Vite's loadEnv).
 */
export function evmRpcUrls(env: Partial<ImportMetaEnv> = {}) {
  return {
    [ChainKeys.SONIC_MAINNET]: env.VITE_SONIC_RPC_URL || 'https://sonic-rpc.publicnode.com',
    [ChainKeys.BASE_MAINNET]: env.VITE_BASE_RPC_URL || 'https://base.drpc.org',
    [ChainKeys.ARBITRUM_MAINNET]: env.VITE_ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org',
    [ChainKeys.OPTIMISM_MAINNET]: env.VITE_OPTIMISM_RPC_URL || 'https://optimism-rpc.publicnode.com',
    [ChainKeys.POLYGON_MAINNET]: env.VITE_POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com',
    [ChainKeys.BSC_MAINNET]: env.VITE_BSC_RPC_URL || 'https://bsc.drpc.org',
    [ChainKeys.AVALANCHE_MAINNET]: env.VITE_AVALANCHE_RPC_URL || 'https://avalanche-c-chain-rpc.publicnode.com',
    [ChainKeys.ETHEREUM_MAINNET]: env.VITE_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    [ChainKeys.HYPEREVM_MAINNET]: env.VITE_HYPEREVM_RPC_URL || 'https://rpc.hyperliquid.xyz/evm',
  } as const satisfies Partial<Record<EvmChainKey, string>>;
}

export type EvmRpcUrls = ReturnType<typeof evmRpcUrls>;

/** `{ [chainKey]: { rpcUrl } }`: the per-chain shape both the SDK and the wallet config take. */
export function toChainRpcConfig(urls: EvmRpcUrls) {
  return Object.fromEntries(Object.entries(urls).map(([chainKey, rpcUrl]) => [chainKey, { rpcUrl }]));
}

// In the browser Vite provides import.meta.env; under Node it is undefined and the defaults apply.
export const EVM_RPC_URLS = evmRpcUrls(import.meta.env);
