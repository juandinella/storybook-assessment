import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/primitives/Button';
import { cn } from '@/lib/cn';
import type { AssistantDensity } from './types';

type SuggestionChipsProps = {
  /** Prompts must be unique: each string is also used as its React key. */
  suggestions: readonly string[];
  /** Reports the selected prompt unchanged; does not submit a request or edit a draft. */
  onSuggestionSelect: (prompt: string) => void;
  disabled?: boolean;
  /** Defaults to comfortable. Compact reduces spacing between buttons without changing their sizing. */
  density?: AssistantDensity;
};

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
            className="h-auto min-h-10 w-full justify-between gap-3 border-sage/30 bg-sage/15 px-3 py-2 text-left leading-5 font-normal whitespace-normal text-text-primary hover:border-sage hover:bg-sage/25 focus-visible:transition-none active:border-sage active:bg-sage/35 active:duration-0 motion-reduce:transition-none"
          >
            <span className="min-w-0 wrap-anywhere">{prompt}</span>
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
