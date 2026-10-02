import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const calloutVariants = cva('rounded-[3px] border p-3 text-[13px]', {
  variants: {
    variant: {
      /** Neutral notice, e.g. "real funds" or custody warnings. */
      notice: 'border-border bg-notice text-foreground',
      destructive: 'border-destructive bg-destructive-muted text-destructive',
      success: 'border-success bg-success-muted text-success',
    },
  },
  defaultVariants: { variant: 'notice' },
});

export function Callout({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof calloutVariants>) {
  return <div role="note" className={cn(calloutVariants({ variant }), className)} {...props} />;
}
