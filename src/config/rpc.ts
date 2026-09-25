import { ChainKeys, type EvmChainKey } from '@sodax/types';

// `import.meta.env` is undefined when this file runs under Node (scripts/preflight.ts).
const env: Partial<ImportMetaEnv> = import.meta.env ?? {};

/**
 * One RPC map shared by the SODAX SDK (`sodax.ts`) and the wallet connector (`wallet.ts`), so reads and
 * wallet calls hit the same endpoints. Public endpoints by default; override with VITE_*_RPC_URL.
 */
export const EVM_RPC_URLS = {
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

export type ConfiguredEvmChainKey = keyof typeof EVM_RPC_URLS;
