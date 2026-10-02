import { SDK_VERSION } from '@sodax/sdk';
import { assetUrl, brand } from '@/brand/brand.config';
import { GlobeIcon } from '@/components/xp/icons';

/** Explorer status bar. */
export function Footer() {
  return (
    <footer className="xp-statusbar">
      <div className="xp-status-field min-w-0 flex-1">
        <span className="truncate">
          © {new Date().getFullYear()} {brand.appName}. Vault deposits carry smart contract and market risk.
        </span>
      </div>
      {/* The installed @sodax/sdk release: a quick check that nothing upgraded the pinned packages. */}
      <div className="xp-status-field hidden sm:flex">SDK {SDK_VERSION}</div>
      {brand.poweredBySodax && (
        <a
          href={brand.links.website}
          target="_blank"
          rel="noopener noreferrer"
          className="xp-status-field hidden hover:underline md:flex"
        >
          Powered by
          <img src={assetUrl('brand/logo-on-light.svg')} alt="SODAX" className="h-3 w-auto" />
        </a>
      )}
      <div className="xp-status-field">
        <GlobeIcon className="size-4" />
        Internet
      </div>
      <div className="xp-grip" aria-hidden />
    </footer>
  );
}
