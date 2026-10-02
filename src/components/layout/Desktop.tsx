import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { DesktopIcons } from './DesktopIcons';
import { Footer } from './Footer';
import { Header } from './Header';
import { BootScreen, type Power, PowerScreen, TurnOffDialog } from './Power';
import { Taskbar } from './Taskbar';
import { TaskPane } from './TaskPane';

type WindowMode = 'normal' | 'maximized' | 'minimized';

const BOOTED_KEY = 'xp-booted';
const BALLOON_KEY = 'xp-balloon-seen';

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setFlag(key: string) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Private mode: the boot screen and balloon just show again next load.
  }
}

/** Show the boot screen once per browser session, and never to users who asked for less motion. */
function initialPower(): Power {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return reduced || readFlag(BOOTED_KEY) ? 'on' : 'boot';
}

/** The XP desktop: Bliss wallpaper, the app as an Explorer window, the taskbar and the power screens. */
export function Desktop({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WindowMode>('normal');
  const [power, setPower] = useState<Power>(initialPower);
  const [balloonOpen, setBalloonOpen] = useState(false);

  const finishBoot = useCallback(() => {
    setFlag(BOOTED_KEY);
    setPower('on');
  }, []);
  const cancelTurnOff = useCallback(() => setPower('on'), []);

  // The security balloon pops up from the tray once per session, shortly after the desktop appears.
  useEffect(() => {
    if (power !== 'on' || readFlag(BALLOON_KEY)) return;
    const id = setTimeout(() => {
      setFlag(BALLOON_KEY);
      setBalloonOpen(true);
    }, 1200);
    return () => clearTimeout(id);
  }, [power]);

  const goTo = useCallback((sectionId: string) => {
    setMode(m => (m === 'minimized' ? 'normal' : m));
    requestAnimationFrame(() =>
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }, []);

  const maximized = mode === 'maximized';

  return (
    <div className="xp-desktop flex min-h-screen flex-col pb-[30px]">
      <DesktopIcons onOpenVaults={() => goTo('vaults')} forceShow={mode === 'minimized'} />

      <main className={cn('relative z-10 flex flex-1 flex-col', !maximized && 'p-1.5 sm:p-6')}>
        <div
          className={cn(
            'xp-window mx-auto w-full',
            maximized ? 'xp-window-flat min-h-full flex-1' : 'max-w-[1100px]',
            mode === 'minimized' && 'hidden',
          )}
        >
          <Header
            maximized={maximized}
            onMinimize={() => setMode('minimized')}
            onMaximize={() => setMode(maximized ? 'normal' : 'maximized')}
            onClose={() => setPower('turn-off')}
            onGoTo={goTo}
          />
          <div className="flex flex-1 bg-window">
            <TaskPane onGoTo={goTo} onSecurity={() => setBalloonOpen(true)} className="hidden lg:flex" />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          <Footer />
        </div>
      </main>

      <Taskbar
        windowMinimized={mode === 'minimized'}
        onToggleWindow={() => setMode(m => (m === 'minimized' ? 'normal' : 'minimized'))}
        onGoTo={goTo}
        onTurnOff={() => setPower('turn-off')}
        onSecurity={() => setBalloonOpen(true)}
        balloonOpen={balloonOpen && power === 'on'}
        onBalloonClose={() => setBalloonOpen(false)}
      />

      {power === 'boot' && <BootScreen onDone={finishBoot} />}
      {power === 'turn-off' && <TurnOffDialog onChoose={setPower} onCancel={cancelTurnOff} />}
      <PowerScreen power={power} setPower={setPower} />
    </div>
  );
}
