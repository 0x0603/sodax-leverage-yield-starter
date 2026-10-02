import * as Menu from '@radix-ui/react-dropdown-menu';
import { KeyRoundIcon, PowerIcon, Wallet as WalletGlyph, XIcon } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { assetUrl, brand } from '@/brand/brand.config';
import { Tooltip } from '@/components/ui/tooltip';
import { FolderIcon, GlobeIcon, HelpIcon, SafeIcon, ShieldIcon, WalletIcon } from '@/components/xp/icons';
import { explorerAddressUrl } from '@/lib/chains';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useEvmWallet } from '@/wallet';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function StartItem({
  icon,
  title,
  sub,
  href,
  disabled,
  onSelect,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  const body = (
    <>
      {icon}
      <span className="min-w-0">
        {title}
        {sub && <span className="xp-sm-item-sub">{sub}</span>}
      </span>
    </>
  );
  if (href) {
    return (
      <Menu.Item asChild className="xp-sm-item">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      </Menu.Item>
    );
  }
  return (
    <Menu.Item className="xp-sm-item" disabled={disabled} onSelect={onSelect}>
      {body}
    </Menu.Item>
  );
}

function StartMenu({ onGoTo, onTurnOff, onSecurity }: TaskbarActions) {
  const { address, currentChainKey, connect, disconnect } = useEvmWallet();
  const explorer = address && currentChainKey ? explorerAddressUrl(currentChainKey, address) : undefined;

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger className="xp-start" aria-label="Start">
        <img src={assetUrl('brand/favicon.svg')} alt="" className="size-5 drop-shadow" />
        start
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content side="top" align="start" sideOffset={0} className="xp-startmenu z-50">
          <div className="xp-sm-top">
            <span className="xp-sm-avatar">
              <img src={assetUrl('brand/favicon.svg')} alt="" className="size-8" />
            </span>
            <span className="truncate">{address ? shortenAddress(address) : 'Guest'}</span>
          </div>
          <div className="xp-sm-cols">
            <div className="xp-sm-left">
              <StartItem
                icon={<FolderIcon className="size-8" />}
                title="Vaults"
                sub="Browse and deposit"
                onSelect={() => onGoTo('vaults')}
              />
              <StartItem
                icon={<WalletIcon className="size-8" />}
                title="My Positions"
                sub="Shares you hold"
                onSelect={() => (address ? onGoTo('positions') : connect())}
              />
              <div className="xp-sm-sep" />
              <StartItem icon={<HelpIcon className="size-6" />} title="SODAX Docs" href={brand.links.docs} />
              <StartItem icon={<GlobeIcon className="size-6" />} title="sodax.com" href={brand.links.website} />
            </div>
            <div className="xp-sm-right">
              <StartItem
                icon={<WalletIcon className="size-6" />}
                title={address ? 'Copy Address' : 'Connect Wallet'}
                onSelect={() => (address ? void navigator.clipboard.writeText(address) : connect())}
              />
              {explorer && <StartItem icon={<GlobeIcon className="size-6" />} title="My Explorer" href={explorer} />}
              <div className="xp-sm-sep" />
              <StartItem icon={<ShieldIcon className="size-6" />} title="Security Center" onSelect={onSecurity} />
              <StartItem icon={<HelpIcon className="size-6" />} title="Help and Support" href={brand.links.docs} />
              <StartItem
                icon={<SafeIcon className="size-6" />}
                title="Vault Statistics"
                onSelect={() => onGoTo('vaults')}
              />
            </div>
          </div>
          <div className="xp-sm-bottom">
            <Menu.Item className="xp-sm-power" disabled={!address} onSelect={() => void disconnect()}>
              <span className="xp-power-glyph xp-power-glyph-logoff">
                <KeyRoundIcon className="size-3.5" />
              </span>
              Log Off
            </Menu.Item>
            <Menu.Item className="xp-sm-power" onSelect={onTurnOff}>
              <span className="xp-power-glyph xp-power-glyph-off">
                <PowerIcon className="size-3.5" />
              </span>
              Turn Off Computer
            </Menu.Item>
          </div>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

function Balloon({ onClose }: { onClose: () => void }) {
  return (
    <div role="alert" className="xp-balloon">
      <div className="flex items-start gap-2">
        <ShieldIcon className="size-5" />
        <div className="flex-1">
          <p className="font-bold">Your funds might be at risk</p>
          <p className="mt-1">
            These vaults run on mainnet with real money. Leverage multiplies yield and losses, and the APR can go
            negative.
          </p>
          <a
            href={brand.links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-link underline"
          >
            Read the SODAX docs
          </a>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-4 items-center justify-center rounded-[2px] border border-transparent hover:border-border"
        >
          <XIcon className="size-3" />
        </button>
      </div>
    </div>
  );
}

type TaskbarActions = {
  onGoTo: (sectionId: string) => void;
  onTurnOff: () => void;
  onSecurity: () => void;
};

export function Taskbar({
  windowMinimized,
  onToggleWindow,
  balloonOpen,
  onBalloonClose,
  ...actions
}: TaskbarActions & {
  windowMinimized: boolean;
  onToggleWindow: () => void;
  balloonOpen: boolean;
  onBalloonClose: () => void;
}) {
  const { address, connect } = useEvmWallet();
  const now = useClock();

  return (
    <>
      {balloonOpen && <Balloon onClose={onBalloonClose} />}
      <div className="xp-taskbar">
        <StartMenu {...actions} />
        <div className="flex min-w-0 flex-1 items-stretch px-2">
          <button
            type="button"
            className="xp-task-btn"
            aria-pressed={!windowMinimized}
            onClick={onToggleWindow}
            title={windowMinimized ? 'Restore' : 'Minimize'}
          >
            <img src={assetUrl('brand/favicon.svg')} alt="" className="size-4 shrink-0" />
            <span className="truncate">{brand.appName}</span>
          </button>
        </div>
        <div className="xp-tray">
          <Tooltip content="Security Center: review the risks">
            <button type="button" className="xp-tray-icon" aria-label="Security Center" onClick={actions.onSecurity}>
              <ShieldIcon className="size-4" />
            </button>
          </Tooltip>
          <Tooltip
            content={
              address ? `Wallet connected: ${shortenAddress(address)}` : 'Wallet not connected. Click to connect.'
            }
          >
            <button
              type="button"
              className="xp-tray-icon"
              aria-label={address ? 'Wallet connected' : 'Connect wallet'}
              onClick={address ? undefined : connect}
            >
              <WalletGlyph className="size-4" />
              <span
                className={cn(
                  'absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-white',
                  address ? 'bg-success' : 'bg-destructive',
                )}
              />
            </button>
          </Tooltip>
          <Tooltip
            content={now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          >
            <span className="cursor-default tabular-nums">
              {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
