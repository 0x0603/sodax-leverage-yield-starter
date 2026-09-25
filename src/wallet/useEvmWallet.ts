import { baseChainInfo, type EvmChainKey, type IEvmWalletProvider } from '@sodax/types';
import {
  useEvmSwitchChain,
  useWalletModal,
  useWalletProvider,
  useXAccount,
  useXConnection,
  useXDisconnect,
} from '@sodax/wallet-sdk-react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { DEFAULT_SOURCE_CHAIN } from '@/config/workshop';

const EVM_CHAIN_KEY_BY_ID = new Map<number, EvmChainKey>(
  Object.values(baseChainInfo)
    .filter(chain => chain.type === 'EVM')
    .map(chain => [chain.chainId as number, chain.key as EvmChainKey]),
);

export type EvmWallet = {
  /** Connected EOA (same address on every EVM chain), or undefined when disconnected. */
  address: Address | undefined;
  isConnected: boolean;
  /** The chain the wallet is currently on, if it's one SODAX knows. */
  currentChainKey: EvmChainKey | undefined;
  /** Pass this as `walletProvider` to SDK calls / dapp-kit mutations for `chainKey`. */
  walletProvider: IEvmWalletProvider | undefined;
  /** True when connected but the wallet is on a different chain than `chainKey`. */
  isWrongChain: boolean;
  /** Ask the wallet to switch to `chainKey`. */
  switchChain: () => void;
  /** Open the connect modal. */
  connect: () => void;
  disconnect: () => Promise<void>;
  connectorId: string | undefined;
};

/**
 * The one wallet API feature code should use.
 *
 * @param chainKey The EVM chain you are about to transact on (e.g. the deposit source chain). The returned
 *   `walletProvider` and `isWrongChain` are for that chain. Defaults to the workshop's default source chain.
 *
 * @example
 * const { address, walletProvider, isWrongChain, switchChain } = useEvmWallet(srcChainKey);
 * if (isWrongChain) return <Button onClick={switchChain}>Switch network</Button>;
 * await vaultSwap({ ...payload, walletProvider });
 */
export function useEvmWallet(chainKey: EvmChainKey = DEFAULT_SOURCE_CHAIN): EvmWallet {
  const account = useXAccount({ xChainType: 'EVM' });
  const connection = useXConnection({ xChainType: 'EVM' });
  const walletProvider = useWalletProvider({ xChainId: chainKey });
  const { isWrongChain, handleSwitchChain } = useEvmSwitchChain({ xChainId: chainKey });
  const { chainId } = useAccount();
  const modal = useWalletModal();
  const disconnect = useXDisconnect();

  const address = account.address as Address | undefined;

  return {
    address,
    isConnected: !!address,
    currentChainKey: chainId ? EVM_CHAIN_KEY_BY_ID.get(chainId) : undefined,
    walletProvider: walletProvider as IEvmWalletProvider | undefined,
    isWrongChain: !!address && isWrongChain,
    switchChain: handleSwitchChain,
    connect: () => {
      modal.open();
      modal.selectChain('EVM');
    },
    disconnect: () => disconnect({ xChainType: 'EVM' }),
    connectorId: connection?.xConnectorId,
  };
}
