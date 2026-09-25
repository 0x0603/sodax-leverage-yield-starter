/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SONIC_RPC_URL?: string;
  readonly VITE_BASE_RPC_URL?: string;
  readonly VITE_ARBITRUM_RPC_URL?: string;
  readonly VITE_OPTIMISM_RPC_URL?: string;
  readonly VITE_POLYGON_RPC_URL?: string;
  readonly VITE_BSC_RPC_URL?: string;
  readonly VITE_AVALANCHE_RPC_URL?: string;
  readonly VITE_ETHEREUM_RPC_URL?: string;
  readonly VITE_HYPEREVM_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Buffer: typeof import('buffer').Buffer;
}
