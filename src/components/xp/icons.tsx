import { type ComponentProps, type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

/** XP-style illustrated icons. Decorative: pair them with a visible label. */
type IconProps = Omit<ComponentProps<'svg'>, 'children'>;

function Svg({ className, ...props }: IconProps & { children: ReactNode }) {
  return <svg viewBox="0 0 48 48" aria-hidden className={cn('size-12 shrink-0', className)} {...props} />;
}

export function FolderIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset="1" stopColor="#e9b543" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c4" />
          <stop offset=".5" stopColor="#f9d36b" />
          <stop offset="1" stopColor="#e3a92a" />
        </linearGradient>
      </defs>
      <path
        d="M4 12a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"
        fill={`url(#${id}b)`}
        stroke="#b9861e"
      />
      <path
        d="M4 19a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"
        fill={`url(#${id}f)`}
        stroke="#c48f1f"
      />
      <path d="M8 20h32" stroke="#fff" strokeOpacity=".7" />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <radialGradient id={`${id}s`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#b9e0ff" />
          <stop offset=".5" stopColor="#3b8ee6" />
          <stop offset="1" stopColor="#1550a8" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill={`url(#${id}s)`} stroke="#1b5fb5" />
      <path
        d="M13 13c4-2 9-1 10 2s-3 4-2 7 5 3 4 7-6 5-8 2-1-6-4-7-4-3-3-6 1-4 3-5zM30 26c3-1 7 1 7 4s-3 6-6 5-3-3-3-5 0-3 2-4zM28 9c3 0 6 1 7 3s-2 3-4 2-4-1-4-3 0-2 1-2z"
        fill="#62c23e"
        stroke="#3a8a1f"
        strokeWidth=".8"
      />
      <ellipse cx="18" cy="14" rx="9" ry="5" fill="#fff" opacity=".35" />
    </Svg>
  );
}

export function HelpIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fa8f5" />
          <stop offset="1" stopColor="#2552c4" />
        </linearGradient>
      </defs>
      <path d="M11 5h25a4 4 0 0 1 4 4v29H13a4 4 0 0 0-4 4V7a2 2 0 0 1 2-2z" fill={`url(#${id}c)`} stroke="#1d3f8f" />
      <path d="M9 42a4 4 0 0 1 4-4h27v6H13a4 4 0 0 1-4-2z" fill="#f6f6f2" stroke="#1d3f8f" />
      <text
        x="25"
        y="29"
        textAnchor="middle"
        fontFamily="Trebuchet MS, Tahoma, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#fff"
      >
        ?
      </text>
    </Svg>
  );
}

export function RecycleBinIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2f5f8" />
          <stop offset=".5" stopColor="#c6ced8" />
          <stop offset="1" stopColor="#97a3b1" />
        </linearGradient>
      </defs>
      <path d="M11 12h26l-3 31H14z" fill={`url(#${id}g)`} stroke="#6b7785" />
      <ellipse cx="24" cy="12" rx="13" ry="3.5" fill="#dde3ea" stroke="#6b7785" />
      <path d="M17.5 18l1.3 21M24 18v21M30.5 18l-1.3 21" stroke="#8a96a3" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a73" />
          <stop offset="1" stopColor="#b8240f" />
        </linearGradient>
      </defs>
      <path
        d="M24 3l17 6v13c0 10-7 19-17 23C14 41 7 32 7 22V9z"
        fill={`url(#${id}r)`}
        stroke="#fff"
        strokeWidth="2.5"
      />
      <path d="M24 13v14" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="24" cy="35" r="3" fill="#fff" />
    </Svg>
  );
}

export function SafeIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4e8ee" />
          <stop offset="1" stopColor="#8794a3" />
        </linearGradient>
        <radialGradient id={`${id}d`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#aab4c0" />
        </radialGradient>
      </defs>
      <rect x="6" y="7" width="36" height="32" rx="3" fill={`url(#${id}b)`} stroke="#4a5563" />
      <rect x="10" y="11" width="28" height="24" rx="2" fill="none" stroke="#6b7785" />
      <circle cx="24" cy="23" r="7" fill={`url(#${id}d)`} stroke="#4a5563" />
      <path d="M24 17v3M24 26v3M18 23h3M27 23h3" stroke="#4a5563" />
      <path d="M10 39h6v3h-6zM32 39h6v3h-6z" fill="#4a5563" />
    </Svg>
  );
}

export function WalletIcon(props: IconProps) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d79a5a" />
          <stop offset="1" stopColor="#8a5323" />
        </linearGradient>
      </defs>
      <rect x="5" y="12" width="38" height="28" rx="4" fill={`url(#${id}w)`} stroke="#6a3d12" />
      <path d="M5 18h38" stroke="#6a3d12" strokeOpacity=".5" />
      <rect x="29" y="21" width="14" height="10" rx="2" fill="#a8692f" stroke="#6a3d12" />
      <circle cx="35" cy="26" r="2" fill="#ffd27d" />
    </Svg>
  );
}
