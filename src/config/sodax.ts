import type { SodaxOptions } from '@sodax/sdk';
import { EVM_RPC_URLS } from './rpc';

/**
 * SODAX SDK config: mainnet, production solver and API (the SDK defaults), no API key, no partner fee.
 *
 * Keep this a module-level constant. `SodaxProvider` rebuilds the SDK instance whenever the config object
 * identity changes, so building it inside a component would reset every query on each render.
 */
export const sodaxConfig: SodaxOptions = {
  chains: Object.fromEntries(Object.entries(EVM_RPC_URLS).map(([chainKey, rpcUrl]) => [chainKey, { rpcUrl }])),
};
