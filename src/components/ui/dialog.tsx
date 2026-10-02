import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';
import { assetUrl, brand } from '@/brand/brand.config';
import { TitleBar, TitleButton } from '@/components/xp/Window';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/** A modal XP window. `windowTitle` goes in the title bar; DialogTitle stays in the body for screen readers. */
export function DialogContent({
  className,
  children,
  windowTitle = brand.appName,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { windowTitle?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25" />
      <DialogPrimitive.Content
        className={cn(
          'xp-window fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 text-card-foreground',
          className,
        )}
        {...props}
      >
        <TitleBar
          title={windowTitle}
          icon={<img src={assetUrl('brand/favicon.svg')} alt="" className="size-4" />}
          controls={
            <DialogPrimitive.Close asChild>
              <TitleButton kind="close" />
            </DialogPrimitive.Close>
          }
        />
        <div className="grid min-h-0 gap-4 overflow-y-auto p-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('font-title text-lg font-bold', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-[13px] text-muted-foreground', className)} {...props} />;
}
