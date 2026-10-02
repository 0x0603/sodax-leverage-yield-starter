import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TitleButtonKind = 'minimize' | 'maximize' | 'restore' | 'close' | 'help';

const LABEL: Record<TitleButtonKind, string> = {
  minimize: 'Minimize',
  maximize: 'Maximize',
  restore: 'Restore',
  close: 'Close',
  help: 'Help',
};

const GLYPH: Record<TitleButtonKind, ReactNode> = {
  minimize: <rect x="2" y="8" width="6" height="2.5" fill="currentColor" />,
  maximize: <path d="M1.5 1.5h8v8h-8z M1.5 2.5h8" stroke="currentColor" strokeWidth="2" fill="none" />,
  restore: (
    <path d="M3.5 1h6v6M1 4h6v6H1z M1 5h6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="miter" />
  ),
  close: <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="2.2" />,
  help: (
    <text x="5.5" y="10" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
      ?
    </text>
  ),
};

/** Minimize / maximize / close button for a title bar. */
export function TitleButton({
  kind,
  className,
  ...props
}: { kind: TitleButtonKind } & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button
      type="button"
      aria-label={LABEL[kind]}
      title={LABEL[kind]}
      className={cn('xp-title-btn', kind === 'close' && 'xp-title-btn-close', className)}
      {...props}
    >
      <svg viewBox="0 0 11 11" className="size-[11px]" aria-hidden>
        {GLYPH[kind]}
      </svg>
    </button>
  );
}

export function TitleBar({
  title,
  icon,
  controls,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  controls?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('xp-titlebar', className)}>
      {icon}
      <span className="xp-titlebar-text">{title}</span>
      {controls && <div className="flex items-center gap-0.5">{controls}</div>}
    </div>
  );
}

/** A Luna window: blue title bar over a beige body. */
export function Window({
  title,
  icon,
  controls,
  active = true,
  className,
  bodyClassName,
  children,
  ...props
}: {
  title: ReactNode;
  icon?: ReactNode;
  controls?: ReactNode;
  active?: boolean;
  bodyClassName?: string;
} & Omit<ComponentProps<'section'>, 'title'>) {
  return (
    <section className={cn('xp-window', !active && 'xp-window-inactive', className)} {...props}>
      <TitleBar title={title} icon={icon} controls={controls} />
      <div className={cn('flex min-h-0 flex-1 flex-col', bodyClassName)}>{children}</div>
    </section>
  );
}

/** Indeterminate green-block progress bar. */
export function XpProgress({ className, label }: { className?: string; label: string }) {
  return (
    <div role="progressbar" aria-label={label} className={cn('xp-progress', className)}>
      <div className="xp-progress-blocks" />
    </div>
  );
}
