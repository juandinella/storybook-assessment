import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { IconButton } from '@/primitives/IconButton';
import { Textarea } from '@/primitives/Textarea';
import type { AssistantStatus } from './types';

type ComposerProps = {
  /** Optional shared ref to the draft field; uses a local ref when omitted. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  /** Controlled draft; remains editable while streaming. */
  value: string;
  /** Hint shown for an empty draft. Defaults to "Ask a question...". */
  placeholder?: string;
  /** Streaming replaces Send with Stop and blocks submission; idle and error allow sending non-blank drafts. */
  status: AssistantStatus;
  /** Reports the full draft after an edit; the consumer must update value. */
  onValueChange: (value: string) => void;
  /** Requests submission of the current non-blank draft when not streaming; does not clear value. */
  onSubmit: () => void;
  /** Requests cancellation; the consumer must stop generation and update the controlled state. */
  onStop: () => void;
};

export function Composer({
  value,
  placeholder = 'Ask a question...',
  status,
  onValueChange,
  onSubmit,
  onStop,
  textareaRef,
}: ComposerProps) {
  const inputId = useId();
  const hintId = useId();
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = textareaRef ?? localTextareaRef;
  const composing = useRef(false);
  const compositionEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const streaming = status === 'streaming';
  const canSubmit = !streaming && value.trim().length > 0;

  useEffect(() => () => clearTimeout(compositionEndTimer.current), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    inputRef.current?.focus({ preventScroll: true });
    onSubmit();
  }

  function handleCompositionStart() {
    clearTimeout(compositionEndTimer.current);
    composing.current = true;
  }

  function handleCompositionEnd() {
    compositionEndTimer.current = setTimeout(() => {
      composing.current = false;
    }, 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      composing.current
    )
      return;
    event.preventDefault();
    if (canSubmit) onSubmit();
  }

  function handleStopClick(event: MouseEvent<HTMLButtonElement>) {
    if (!streaming) return;
    event.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
    onStop();
  }

  return (
    <form
      aria-label="Assistant composer"
      className="rounded-md border border-border-default bg-bg-surface has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-focus forced-colors:has-[textarea:focus-visible]:outline-2 forced-colors:has-[textarea:focus-visible]:outline-offset-2"
      onSubmit={handleSubmit}
    >
      <label htmlFor={inputId} className="sr-only">
        Message to assistant
      </label>
      <Textarea
        ref={inputRef}
        id={inputId}
        value={value}
        rows={2}
        aria-describedby={hintId}
        placeholder={placeholder}
        className="scrollbar-thin block min-h-20 resize-none border-0 bg-transparent px-3.5 pt-3.5 pb-2 leading-6 focus-visible:ring-0"
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
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
          className="shrink-0 bg-accent text-text-inverse transition-[background-color] duration-150 ease-[ease] hover:bg-accent-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface focus-visible:transition-none motion-reduce:transition-none aria-disabled:opacity-50 aria-disabled:hover:bg-accent"
          onClick={handleStopClick}
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
