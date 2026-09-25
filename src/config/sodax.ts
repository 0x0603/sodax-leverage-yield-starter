import type { SodaxOptions } from '@sodax/sdk';
import { EVM_RPC_URLS, type EvmRpcUrls, toChainRpcConfig } from './rpc';

export function createSodaxConfig(rpcUrls: EvmRpcUrls = EVM_RPC_URLS): SodaxOptions {
  return { chains: toChainRpcConfig(rpcUrls) };
}

/**
 * SODAX SDK config: mainnet, production solver and API (the SDK defaults), no API key, no partner fee.
 *
 * Keep this a module-level constant. `SodaxProvider` rebuilds the SDK instance whenever the config object
 * identity changes, so building it inside a component would reset every query on each render.
 */
export const sodaxConfig = createSodaxConfig();
