import { cn } from '@/lib/cn';

export type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
};

export function Spinner({ className, size = 'md', label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        size === 'sm' ? 'size-4' : 'size-5',
        className,
      )}
    />
  );
}
