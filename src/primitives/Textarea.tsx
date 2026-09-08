import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

export type TextareaProps = ComponentPropsWithRef<'textarea'> & {
  error?: boolean;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn(
        'min-h-20 w-full rounded-[var(--radius-sm)] border bg-bg-surface px-3 py-2 text-sm text-text-primary',
        'placeholder:text-text-tertiary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger' : 'border-border-subtle',
        className,
      )}
      {...props}
    />
  );
}
