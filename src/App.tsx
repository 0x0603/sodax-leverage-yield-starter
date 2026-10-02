import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/layout/Hero';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BridgePanel } from '@/features/bridge/BridgePanel';
import { LeverageYieldPage } from '@/features/leverage-yield/LeverageYieldPage';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'vaults', label: 'Vaults' },
  { id: 'bridge', label: 'Bridge' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function App() {
  const [tab, setTab] = useState<Tab>('vaults');
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div role="tablist" className="flex w-fit gap-1 rounded-full border bg-card p-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'rounded-full px-5 py-1.5 text-sm font-medium transition-colors',
                    tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'vaults' ? <LeverageYieldPage /> : <BridgePanel />}
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
