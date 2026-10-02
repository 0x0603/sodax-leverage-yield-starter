import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

/** Simple tooltip: <Tooltip content="Explanation"><InfoIcon /></Tooltip> */
export function Tooltip({
  content,
  children,
  className,
  ...props
}: { content: ReactNode; children: ReactNode } & ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn('xp-tooltip z-50 max-w-xs px-2 py-1 text-xs', className)}
          {...props}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
