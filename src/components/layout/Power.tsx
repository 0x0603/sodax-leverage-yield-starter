import { MoonIcon, PowerIcon, RotateCcwIcon } from 'lucide-react';
import { type ReactNode, type Ref, useEffect, useId, useRef } from 'react';
import { assetUrl, brand } from '@/brand/brand.config';
import { Button } from '@/components/ui/button';

export type Power = 'boot' | 'on' | 'turn-off' | 'shutting-down' | 'restarting' | 'off' | 'standby';

const BOOT_MS = 2800;
const SHUTDOWN_MS = 1800;

export function BootScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, BOOT_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <button type="button" className="xp-boot" onClick={onDone} aria-label="Starting up. Click to skip.">
      <span className="flex flex-col items-center gap-4">
        <img src={assetUrl(brand.logo.onDark)} alt="" className="h-9 w-auto" />
        <span className="font-title text-4xl font-bold tracking-tight">
          {brand.appName}
          <span className="xp-boot-mark ml-1">{brand.productLabel.toLowerCase()}</span>
        </span>
      </span>
      <span className="xp-boot-bar">
        <span className="xp-boot-blocks">
          <span className="xp-boot-block" />
          <span className="xp-boot-block" />
          <span className="xp-boot-block" />
        </span>
      </span>
      <span className="absolute bottom-6 left-6 text-xs text-subtle-foreground">Copyright © SODAX</span>
      <span className="absolute right-6 bottom-6 font-title text-lg font-bold italic">SODAX</span>
    </button>
  );
}

function Choice({
  kind,
  label,
  icon,
  onClick,
  buttonRef,
}: {
  kind: 'standby' | 'off' | 'restart';
  label: string;
  icon: ReactNode;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button ref={buttonRef} type="button" className="xp-turnoff-choice" onClick={onClick}>
      <span className={`xp-round-btn xp-round-btn-${kind}`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/** "Turn off computer": the screen behind fades to grey. */
export function TurnOffDialog({ onChoose, onCancel }: { onChoose: (next: Power) => void; onCancel: () => void }) {
  const titleId = useId();
  const turnOffRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    turnOffRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="xp-turnoff-backdrop">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="xp-turnoff">
        <div className="xp-turnoff-head">
          <span id={titleId}>Turn off computer</span>
          <img src={assetUrl('brand/favicon.svg')} alt="" className="ml-auto size-6" />
        </div>
        <div className="xp-turnoff-body">
          <Choice
            kind="standby"
            label="Stand By"
            icon={<MoonIcon className="size-4" />}
            onClick={() => onChoose('standby')}
          />
          <Choice
            kind="off"
            label="Turn Off"
            icon={<PowerIcon className="size-4" />}
            onClick={() => onChoose('shutting-down')}
            buttonRef={turnOffRef}
          />
          <Choice
            kind="restart"
            label="Restart"
            icon={<RotateCcwIcon className="size-4" />}
            onClick={() => onChoose('restarting')}
          />
        </div>
        <div className="xp-turnoff-foot">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Shutting down / restarting, then the black screens. */
export function PowerScreen({ power, setPower }: { power: Power; setPower: (next: Power) => void }) {
  useEffect(() => {
    if (power !== 'shutting-down' && power !== 'restarting') return;
    const id = setTimeout(() => setPower(power === 'restarting' ? 'boot' : 'off'), SHUTDOWN_MS);
    return () => clearTimeout(id);
  }, [power, setPower]);

  if (power === 'shutting-down' || power === 'restarting') {
    return (
      <div className="xp-screen xp-screen-welcome" role="status">
        <img src={assetUrl(brand.logo.onDark)} alt="" className="h-8 w-auto" />
        <p className="text-2xl">{power === 'restarting' ? 'Restarting…' : 'Shutting down…'}</p>
        <p className="text-sm text-hero-muted">Saving your settings</p>
      </div>
    );
  }
  if (power === 'off' || power === 'standby') {
    return (
      <button
        type="button"
        className="xp-screen xp-screen-black"
        onClick={() => setPower(power === 'off' ? 'boot' : 'on')}
      >
        {power === 'off' ? (
          <>
            <span className="font-bold text-xl">It's now safe to turn off your computer.</span>
            <span className="text-xs text-subtle-foreground">Click anywhere to start again.</span>
          </>
        ) : (
          <span className="text-xs text-subtle-foreground">Stand by. Click to wake up.</span>
        )}
      </button>
    );
  }
  return null;
}
