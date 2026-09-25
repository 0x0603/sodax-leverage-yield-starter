import path from 'node:path';
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Wallet wiring mirrors sodax-sdks/apps/wallet-modal-example. Don't change it during the workshop.
export default defineConfig(({ mode }) => {
  // Only VITE_-prefixed variables are read here (and only those reach the bundle).
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [tailwindcss(), react(), nodePolyfills({ protocolImports: true })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        buffer: 'buffer/',
      },
      // One instance each, or wallet hooks fire on a different React / QueryClient than the app sees
      // (symptom: blank page or "No QueryClient set").
      dedupe: ['react', 'react-dom', '@tanstack/react-query', 'wagmi'],
    },
    optimizeDeps: {
      // Pre-bundle up front so adding an import mid-session doesn't trigger a full dependency re-optimise.
      include: [
        'buffer',
        'viem',
        '@sodax/sdk',
        '@sodax/types',
        '@sodax/dapp-kit',
        '@sodax/wallet-sdk-react',
        '@tanstack/react-query',
      ],
    },
    build: {
      // The wallet SDKs (all chain families ship in @sodax/wallet-sdk-react) make one large bundle. Expected.
      chunkSizeWarningLimit: 12_000,
    },
    server: {
      port: 5173,
      open: true,
    },
    define: {
      global: 'globalThis',
      // Keep empty: some dependencies read process.env in the browser, but the real environment must
      // never be inlined into the bundle.
      'process.env': {},
      'process.version': JSON.stringify(''),
    },
  };
});
