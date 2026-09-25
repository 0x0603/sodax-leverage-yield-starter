import type { SodaxWalletConfig } from '@sodax/wallet-sdk-react';
import { EVM_RPC_URLS } from './rpc';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

/**
 * Wallet connectivity: EVM only. One wagmi connection covers every EVM chain SODAX supports. Browser
 * extension wallets are discovered via EIP-6963; WalletConnect is added only when a project id is set.
 *
 * `SodaxWalletProvider` reads this once on mount; later changes are ignored. Keep it a module constant.
 */
export const walletConfig: SodaxWalletConfig = {
  EVM: {
    // Hydration timing flag (not "is this an SSR app"): defers wagmi's reconnect into an effect.
    ssr: true,
    reconnectOnMount: true,
    walletConnect: walletConnectProjectId ? { projectId: walletConnectProjectId } : undefined,
    chains: Object.fromEntries(Object.entries(EVM_RPC_URLS).map(([chainKey, rpcUrl]) => [chainKey, { rpcUrl }])),
  },
};
