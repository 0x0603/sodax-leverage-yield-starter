import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-px text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-border-light bg-secondary text-secondary-foreground',
      muted: 'border-border-light bg-muted text-muted-foreground',
      success: 'border-success/40 bg-success-muted text-success',
      destructive: 'border-destructive/40 bg-destructive-muted text-destructive',
      outline: 'border-border text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
