import { createSodaxQueryClient, SodaxProvider } from '@sodax/dapp-kit';
import { SodaxWalletProvider } from '@sodax/wallet-sdk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { sodaxConfig } from './config/sodax';
import { walletConfig } from './config/wallet';

// Module-level: one client for the app's lifetime.
const queryClient = createSodaxQueryClient();

/**
 * Canonical SODAX provider stack (same order as sodax-sdks/apps/demo). Don't edit during the workshop.
 *
 * - SodaxProvider: the `Sodax` SDK instance (mainnet), read with `useSodaxContext()` and every dapp-kit hook.
 * - QueryClientProvider: React Query cache for dapp-kit hooks.
 * - SodaxWalletProvider: wallet connectivity (EVM only, see config/wallet.ts).
 *
 * The EVM wallet provider mounts wagmi with its own internal QueryClient around `children`, so the app
 * client is provided again inside it. Otherwise dapp-kit hooks would resolve wagmi's client instead.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SodaxProvider config={sodaxConfig}>
      <QueryClientProvider client={queryClient}>
        <SodaxWalletProvider config={walletConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </QueryClientProvider>
        </SodaxWalletProvider>
      </QueryClientProvider>
    </SodaxProvider>
  );
}
