import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      aria-invalid={error || undefined}
      className={cn(
        'h-9 w-full rounded-[var(--radius-sm)] border bg-bg-surface px-3 text-sm text-text-primary',
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
