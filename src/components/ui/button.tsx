import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** The dialog's default button: blue inner glow. */
        default: 'xp-btn xp-btn-default font-bold',
        secondary: 'xp-btn',
        outline: 'xp-btn',
        ghost: 'xp-btn xp-btn-flat',
        destructive: 'xp-btn xp-btn-danger font-bold',
        /** Green "Go" button, for primary surfaces. */
        accent: 'xp-btn xp-btn-go font-bold',
        link: 'text-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 min-w-[88px] px-4',
        sm: 'h-7 min-w-16 px-3 text-xs',
        lg: 'h-10 min-w-[100px] px-5 text-sm',
        icon: 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    />
  );
}

export { buttonVariants };
