import { Button } from '@/primitives';
import type { SuggestionChipsProps } from './types';

/** Each suggestion is an immediate submission, not a draft replacement. */
export function SuggestionChips({ suggestions, onSuggestionSelect, disabled = false }: SuggestionChipsProps) {
  return (
    <ul aria-label="Suggested prompts" className="flex flex-col gap-2">
      {suggestions.map((prompt) => (
        <li key={prompt}>
          <Button variant="secondary" disabled={disabled}
            className="h-auto min-h-11 w-full justify-start rounded-md px-3 py-3 text-left font-normal whitespace-normal text-text-primary [overflow-wrap:anywhere]"
            onClick={() => onSuggestionSelect(prompt)}>{prompt}</Button>
        </li>
      ))}
    </ul>
  );
}
