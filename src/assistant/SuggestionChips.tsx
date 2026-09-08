import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/primitives/Button';
import { cn } from '@/lib/cn';
import type { SuggestionChipsProps } from './types';

export function SuggestionChips({
  suggestions,
  onSuggestionSelect,
  disabled = false,
  density = 'comfortable',
}: SuggestionChipsProps) {
  return (
    <ul
      aria-label="Suggested questions"
      className={cn(
        'm-0 list-none space-y-2 p-0',
        density === 'compact' && 'space-y-1',
      )}
    >
      {suggestions.map((prompt) => (
        <li key={prompt}>
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => onSuggestionSelect(prompt)}
            className="h-auto min-h-12 w-full justify-between gap-3 px-3 py-2.5 text-left leading-5 font-medium whitespace-normal text-text-primary hover:border-sage hover:bg-sage-surface"
          >
            <span>{prompt}</span>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-accent"
              aria-hidden="true"
            />
          </Button>
        </li>
      ))}
    </ul>
  );
}
