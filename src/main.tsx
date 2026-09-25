import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Providers } from './providers';
import './styles.css';

// Wallet SDKs serialise state containing bigints to JSON.
Object.defineProperty(BigInt.prototype, 'toJSON', {
  value: function toJSON(this: bigint) {
    return this.toString();
  },
  writable: true,
  configurable: true,
});

// Some wallet dependencies expect Node's Buffer global.
if (!window.Buffer) {
  window.Buffer = Buffer;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('#root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
