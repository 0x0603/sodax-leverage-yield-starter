import { Desktop } from '@/components/layout/Desktop';
import { Hero } from '@/components/layout/Hero';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LeverageYieldPage } from '@/features/leverage-yield/LeverageYieldPage';

export function App() {
  return (
    <TooltipProvider>
      <Desktop>
        <Hero />
        <div className="px-4 py-6 sm:px-6">
          <LeverageYieldPage />
        </div>
      </Desktop>
    </TooltipProvider>
  );
}
