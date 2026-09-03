import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: 'p' | 'span';
  tone?: 'primary' | 'secondary' | 'tertiary';
};

const toneClass = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
} as const;

export function Text({ as: Comp = 'p', tone = 'primary', className, ...props }: TextProps) {
  return <Comp className={cn('text-sm leading-6', toneClass[tone], className)} {...props} />;
}
