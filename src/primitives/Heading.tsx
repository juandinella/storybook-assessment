import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
};

const asClass = {
  h1: 'text-2xl font-semibold tracking-tight',
  h2: 'text-lg font-semibold',
  h3: 'text-sm font-semibold uppercase tracking-wide text-text-secondary',
} as const;

export function Heading({ as: Comp = 'h2', className, ...props }: HeadingProps) {
  return <Comp className={cn('text-text-primary', asClass[Comp], className)} {...props} />;
}
