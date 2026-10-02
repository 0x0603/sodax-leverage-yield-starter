import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from 'lucide-react';
import { assetUrl, brand } from '@/brand/brand.config';
import { FolderIcon, HelpIcon } from '@/components/xp/icons';
import { TitleBar, TitleButton } from '@/components/xp/Window';
import { ConnectButton, WalletModal } from '@/wallet';

const MENUS = ['File', 'Edit', 'View', 'Tools'] as const;

/** Explorer chrome: title bar, menu bar, toolbar and address bar. */
export function Header({
  maximized,
  onMinimize,
  onMaximize,
  onClose,
  onGoTo,
}: {
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onGoTo: (sectionId: string) => void;
}) {
  return (
    <header>
      <TitleBar
        title={brand.productLabel ? `${brand.appName} - ${brand.productLabel}` : brand.appName}
        icon={<img src={assetUrl('brand/favicon.svg')} alt="" className="size-4" />}
        controls={
          <>
            <TitleButton kind="minimize" onClick={onMinimize} />
            <TitleButton kind={maximized ? 'restore' : 'maximize'} onClick={onMaximize} />
            <TitleButton kind="close" onClick={onClose} className="ml-0.5" />
          </>
        }
      />

      <nav className="xp-menubar" aria-label="Menu">
        {MENUS.map(m => (
          <span key={m} className="xp-menu-item hidden sm:block">
            <span className="underline">{m[0]}</span>
            {m.slice(1)}
          </span>
        ))}
        <a href={brand.links.website} target="_blank" rel="noopener noreferrer" className="xp-menu-item">
          F<span className="underline">a</span>vorites
        </a>
        <a href={brand.links.docs} target="_blank" rel="noopener noreferrer" className="xp-menu-item">
          <span className="underline">H</span>elp
        </a>
        <span className="xp-menubar-logo">
          <img src={assetUrl(brand.logo.onLight)} alt={brand.logo.alt} className="h-3.5 w-auto" />
        </span>
      </nav>

      <div className="xp-toolbar">
        <button type="button" className="xp-tool-btn" disabled aria-label="Back">
          <span className="xp-nav-icon">
            <ArrowLeftIcon className="size-4" strokeWidth={3} />
          </span>
          <span className="hidden sm:inline">Back</span>
        </button>
        <button type="button" className="xp-tool-btn" disabled aria-label="Forward">
          <span className="xp-nav-icon">
            <ArrowRightIcon className="size-4" strokeWidth={3} />
          </span>
        </button>
        <button
          type="button"
          className="xp-tool-btn"
          aria-label="Up"
          title="Up"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="relative">
            <FolderIcon className="size-6" />
            <ArrowUpIcon className="absolute top-1.5 left-1.5 size-3 text-success" strokeWidth={4} />
          </span>
        </button>
        <span className="xp-toolbar-sep hidden sm:block" />
        <a
          href={brand.links.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="xp-tool-btn hidden sm:inline-flex"
        >
          <HelpIcon className="size-6" />
          Docs
        </a>
        <span className="xp-toolbar-sep hidden sm:block" />
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </div>

      <div className="xp-address">
        <span className="hidden text-muted-foreground sm:inline">Address</span>
        <div className="xp-address-field">
          <FolderIcon className="size-4" />
          <span className="truncate">C:\SODAX\{brand.appName}\Vaults</span>
        </div>
        <button
          type="button"
          className="xp-btn xp-btn-go flex h-[22px] items-center gap-1 px-2 text-xs font-bold"
          onClick={() => onGoTo('vaults')}
        >
          <ArrowRightIcon className="size-3" strokeWidth={4} />
          Go
        </button>
      </div>
      <WalletModal />
    </header>
  );
}
