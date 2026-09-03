import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
};

export function IconButton({ className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)]',
        'text-text-primary hover:bg-bg-subtle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
