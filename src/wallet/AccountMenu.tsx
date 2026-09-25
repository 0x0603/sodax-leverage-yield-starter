import { CheckIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chainLogo, chainName, explorerAddressUrl } from '@/lib/chains';
import { shortenAddress } from '@/lib/format';
import { useEvmWallet } from './useEvmWallet';

export function AccountMenu() {
  const { address, currentChainKey, disconnect } = useEvmWallet();
  const [copied, setCopied] = useState(false);
  if (!address) return null;

  const logo = currentChainKey ? chainLogo(currentChainKey) : undefined;
  const explorer = currentChainKey ? explorerAddressUrl(currentChainKey, address) : undefined;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 pl-2">
          {logo ? (
            <img src={logo} alt="" className="size-6 rounded-full" />
          ) : (
            <span className="size-6 rounded-full bg-muted" />
          )}
          <span className="font-mono">{shortenAddress(address)}</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {currentChainKey ? `Connected on ${chainName(currentChainKey)}` : 'Connected (unsupported network)'}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={event => {
            event.preventDefault();
            void copy();
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy address'}
        </DropdownMenuItem>
        {explorer && (
          <DropdownMenuItem asChild>
            <a href={explorer} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon />
              View on explorer
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void disconnect()}>
          <LogOutIcon />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
