import { ChevronsDownIcon, ChevronsUpIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { brand } from '@/brand/brand.config';
import { FolderIcon, GlobeIcon, HelpIcon, ShieldIcon, WalletIcon } from '@/components/xp/icons';
import { SOURCE_CHAINS } from '@/config/workshop';
import { chainName } from '@/lib/chains';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useEvmWallet } from '@/wallet';

function Group({ title, special, children }: { title: string; special?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={cn('xp-tp-header', special && 'xp-tp-header-special')}
      >
        {title}
        <span className="xp-tp-chevron">
          {open ? (
            <ChevronsUpIcon className="size-3" strokeWidth={3} />
          ) : (
            <ChevronsDownIcon className="size-3" strokeWidth={3} />
          )}
        </span>
      </button>
      {open && <div className={cn('xp-tp-body', special && 'xp-tp-body-special')}>{children}</div>}
    </div>
  );
}

/** Explorer's blue left column: common tasks, other places, details. */
export function TaskPane({
  onGoTo,
  onSecurity,
  className,
}: {
  onGoTo: (sectionId: string) => void;
  onSecurity: () => void;
  className?: string;
}) {
  const { address, connect, disconnect } = useEvmWallet();

  return (
    <aside className={cn('xp-taskpane', className)} aria-label="Tasks">
      <Group title="Vault Tasks" special>
        <button type="button" className="xp-tp-link" onClick={() => onGoTo('vaults')}>
          <FolderIcon className="size-4" />
          Deposit into a vault
        </button>
        <button type="button" className="xp-tp-link" onClick={() => (address ? onGoTo('positions') : connect())}>
          <WalletIcon className="size-4" />
          View my positions
        </button>
        <button type="button" className="xp-tp-link" onClick={onSecurity}>
          <ShieldIcon className="size-4" />
          Review the risks
        </button>
      </Group>

      <Group title="Other Places">
        <a href={brand.links.docs} target="_blank" rel="noopener noreferrer" className="xp-tp-link">
          <HelpIcon className="size-4" />
          SODAX Docs
        </a>
        <a href={brand.links.website} target="_blank" rel="noopener noreferrer" className="xp-tp-link">
          <GlobeIcon className="size-4" />
          sodax.com
        </a>
      </Group>

      <Group title="Details">
        <p className="font-bold">{brand.appName}</p>
        <p>Pooled leveraged staking vaults on Sonic.</p>
        <p>Deposit from {SOURCE_CHAINS.map(chainName).join(', ')}.</p>
        <p>
          Wallet:{' '}
          {address ? (
            <>
              <span className="font-mono">{shortenAddress(address)}</span>{' '}
              <button type="button" className="xp-tp-link inline" onClick={() => void disconnect()}>
                (disconnect)
              </button>
            </>
          ) : (
            <button type="button" className="xp-tp-link inline" onClick={connect}>
              connect
            </button>
          )}
        </p>
      </Group>
    </aside>
  );
}
