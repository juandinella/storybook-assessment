import { useEffect, useId, useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { IconButton } from '@/primitives/IconButton';
import { Textarea } from '@/primitives/Textarea';
import type { ComposerProps } from './types';

export function Composer({
  value,
  status,
  onValueChange,
  onSubmit,
  onStop,
}: ComposerProps) {
  const inputId = useId();
  const hintId = useId();
  const composing = useRef(false);
  const compositionEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const streaming = status === 'streaming';
  const canSubmit = !streaming && value.trim().length > 0;

  useEffect(() => () => clearTimeout(compositionEndTimer.current), []);

  return (
    <form
      aria-label="Assistant composer"
      className="rounded-md border border-border-default bg-bg-surface has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-focus"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        event.currentTarget
          .querySelector('textarea')
          ?.focus({ preventScroll: true });
        onSubmit();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Message to assistant
      </label>
      <Textarea
        id={inputId}
        value={value}
        rows={2}
        aria-describedby={hintId}
        placeholder="Ask about this report..."
        className="scrollbar-thin block min-h-20 resize-none border-0 bg-transparent px-3.5 pt-3.5 pb-2 leading-6 focus-visible:ring-0"
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onCompositionStart={() => {
          clearTimeout(compositionEndTimer.current);
          composing.current = true;
        }}
        onCompositionEnd={() => {
          compositionEndTimer.current = setTimeout(() => {
            composing.current = false;
          }, 0);
        }}
        onKeyDown={(event) => {
          if (
            event.key !== 'Enter' ||
            event.shiftKey ||
            event.nativeEvent.isComposing ||
            composing.current
          )
            return;
          event.preventDefault();
          if (canSubmit) onSubmit();
        }}
      />
      <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-3">
        <span id={hintId} className="text-xs leading-4 text-text-secondary">
          {streaming
            ? 'Keep drafting while I respond'
            : 'Shift + Enter for a new line'}
        </span>
        <IconButton
          type={streaming ? 'button' : 'submit'}
          aria-label={streaming ? 'Stop response' : 'Send message'}
          title={streaming ? 'Stop response' : 'Send message'}
          aria-disabled={!streaming && !canSubmit}
          className="shrink-0 bg-accent text-text-inverse hover:bg-accent-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface aria-disabled:opacity-50"
          onClick={(event) => {
            if (!streaming) return;
            event.preventDefault();
            event.currentTarget.form
              ?.querySelector('textarea')
              ?.focus({ preventScroll: true });
            onStop();
          }}
        >
          {streaming ? (
            <Square size={14} fill="currentColor" aria-hidden="true" />
          ) : (
            <ArrowUp size={18} aria-hidden="true" />
          )}
        </IconButton>
      </div>
    </form>
  );
}
