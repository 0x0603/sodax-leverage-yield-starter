import { type ReactNode, useState } from 'react';
import { brand } from '@/brand/brand.config';
import { FolderIcon, GlobeIcon, HelpIcon, RecycleBinIcon } from '@/components/xp/icons';
import { cn } from '@/lib/utils';

const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

/** Desktop shortcuts: click selects, double-click (or Enter) opens. Wide screens, or whenever the window is minimized. */
export function DesktopIcons({ onOpenVaults, forceShow }: { onOpenVaults: () => void; forceShow: boolean }) {
  const [selected, setSelected] = useState<string>();
  const icons: { id: string; label: string; icon: ReactNode; open?: () => void }[] = [
    { id: 'vaults', label: 'My Vaults', icon: <FolderIcon />, open: onOpenVaults },
    { id: 'docs', label: 'SODAX Docs', icon: <HelpIcon />, open: () => openLink(brand.links.docs) },
    { id: 'web', label: 'sodax.com', icon: <GlobeIcon />, open: () => openLink(brand.links.website) },
    { id: 'bin', label: 'Recycle Bin', icon: <RecycleBinIcon /> },
  ];

  return (
    <nav
      aria-label="Desktop"
      className={cn('fixed top-4 left-3 z-0 flex-col gap-4', forceShow ? 'flex' : 'hidden min-[1360px]:flex')}
    >
      {icons.map(item => (
        <button
          key={item.id}
          type="button"
          className="xp-desktop-icon"
          data-selected={selected === item.id}
          onClick={() => setSelected(item.id)}
          onDoubleClick={item.open}
          onKeyDown={e => e.key === 'Enter' && item.open?.()}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
