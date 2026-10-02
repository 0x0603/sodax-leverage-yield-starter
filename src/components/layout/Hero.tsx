import { brand } from '@/brand/brand.config';
import { SafeIcon } from '@/components/xp/icons';

/** Welcome-screen banner at the top of the window's content. */
export function Hero() {
  return (
    <section className="xp-welcome text-hero-foreground">
      <div className="flex items-center justify-between gap-6 px-6 py-9 sm:px-10">
        <div className="flex flex-col gap-3">
          <p className="font-title text-sm text-hero-muted">Welcome to {brand.appName}</p>
          <h1 className="max-w-3xl font-display text-4xl leading-tight font-bold sm:text-5xl">
            Leveraged staking yield, <span className="font-accent text-hero-accent italic">one</span> deposit.
          </h1>
          <p className="max-w-2xl text-base text-hero-muted">{brand.tagline}</p>
        </div>
        <SafeIcon className="hidden size-28 drop-shadow-lg md:block" />
      </div>
    </section>
  );
}
