import {
  type ComponentProps,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ArrowDown, BookOpen } from 'lucide-react';
import { Heading } from '@/primitives/Heading';
import { IconButton } from '@/primitives/IconButton';
import { Text } from '@/primitives/Text';
import { cn } from '@/lib/cn';
import { AssistantMessage } from './AssistantMessage';
import { Composer } from './Composer';
import { SuggestionChips } from './SuggestionChips';
import { useConversationScroll } from './useConversationScroll';
import type { AssistantDensity, Citation, Message, Suggestion } from './types';

/**
 * Controlled sidebar. Provide a bounded-height parent for independent thread scrolling.
 * A streaming status or message blocks Send, Retry, and suggestions while keeping the draft editable.
 */
type AssistantPanelProps = Omit<
  ComponentProps<typeof Composer>,
  'textareaRef' | 'placeholder'
> & {
  /** Consumer-owned conversation. Replace the array and changed message objects so scrolling and announcements can detect updates. */
  messages: readonly Message[];
  /** Prompts with stable, unique IDs, shown only when messages is empty. */
  suggestions: readonly Suggestion[];
  /** Requests retry of a failed assistant message by ID; the consumer handles generation and message updates. */
  onRetry: (messageId: string) => void;
  /** Requests submission of the selected prompt unchanged; does not edit value or call onSubmit. */
  onSuggestionSelect: (prompt: string) => void;
  /** Reports the selected citation object, including during streaming; the consumer handles source inspection or navigation. */
  onCitationClick: (citation: Citation) => void;
  /** Report context displayed beneath the panel heading. */
  reportTitle: string;
  /** Used in the empty-state greeting; an omitted or empty value produces a generic greeting. */
  greetingName?: string;
  /** Defaults to comfortable. Compact reduces conversation spacing and user-bubble padding, not typography, button sizing, header, or composer styles. */
  density?: AssistantDensity;
  /** Classes merged onto the panel's outer section. */
  className?: string;
  /**
   * Defaults to false. Resumes following when a new user-message ID appears in
   * an existing conversation while the reader is no longer following output.
   * Triggered by messages updates, not by onSubmit. Uses smooth scrolling unless
   * reduced motion is preferred; pointer, wheel, touch, or scroll-key input in
   * the conversation cancels the animation.
   */
  autoScrollOnSubmit?: boolean;
};

export function AssistantPanel({
  messages,
  status,
  value,
  onValueChange,
  onSubmit,
  onStop,
  suggestions,
  onSuggestionSelect,
  onRetry,
  onCitationClick,
  reportTitle,
  greetingName,
  density = 'comfortable',
  className,
  autoScrollOnSubmit = false,
}: AssistantPanelProps) {
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previous = useRef(new Map<string, Message>());
  const [announcement, setAnnouncement] = useState('');
  const {
    threadRef,
    contentRef,
    showLatest,
    cancelSmoothScroll,
    handleThreadScroll,
    handleThreadScrollEnd,
    handleThreadKeyDown,
    handleScrollToLatest,
  } = useConversationScroll({ panelRef, messages, density, autoScrollOnSubmit });
  const hasMessages = messages.length > 0;
  const busy =
    status === 'streaming' ||
    messages.some((message) => message.status === 'streaming');

  function focusDraft() {
    textareaRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const changed = messages.filter((message) => {
      const before = previous.current.get(message.id);
      return (
        message.role === 'assistant' &&
        (!before ||
          before.status !== message.status ||
          before.interrupted !== message.interrupted)
      );
    });
    const turn = changed.at(-1);
    if (turn) {
      setAnnouncement(
        turn.interrupted
          ? turn.content
            ? 'Response stopped. Partial answer preserved.'
            : 'Response stopped. No answer was generated.'
          : turn.status === 'streaming'
            ? 'Preparing response.'
            : turn.status === 'error'
              ? 'Response failed. Retry is available.'
              : 'Response complete.',
      );
    } else if (messages.length === 0) {
      setAnnouncement('');
    }
    previous.current = new Map(
      messages.map((message) => [message.id, message]),
    );
  }, [messages]);

  function handleSuggestionSelect(prompt: string) {
    if (busy) return;
    focusDraft();
    onSuggestionSelect(prompt);
  }

  function handleRetry(id: string) {
    if (busy) return;
    focusDraft();
    onRetry(id);
  }

  return (
    <section
      ref={panelRef}
      aria-labelledby={headingId}
      className={cn(
        'flex h-full min-h-0 w-full max-w-105 flex-col overflow-hidden border border-border-default bg-bg-surface',
        className,
      )}
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-border-subtle px-5 py-4">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-sage-surface text-accent">
          <BookOpen size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <Heading id={headingId} className="text-base leading-6">
            Report assistant
          </Heading>
          <Text tone="secondary" className="text-xs leading-5 wrap-anywhere">
            {reportTitle}
          </Text>
        </div>
      </header>
      <div
        ref={threadRef}
        role="region"
        aria-label="Conversation"
        tabIndex={0}
        onScroll={handleThreadScroll}
        onScrollEnd={handleThreadScrollEnd}
        onWheel={cancelSmoothScroll}
        onTouchStart={cancelSmoothScroll}
        onPointerDown={cancelSmoothScroll}
        onKeyDown={handleThreadKeyDown}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        <div
          ref={contentRef}
          className={cn(
            'flex flex-col gap-7 py-6',
            density === 'compact' && 'gap-4 py-3',
            !hasMessages && 'min-h-full justify-center py-8',
            !hasMessages && density === 'compact' && 'py-5',
          )}
        >
          {messages.length === 0 ? (
            <div>
              <Heading
                as="h3"
                className="text-center text-2xl leading-8 font-semibold tracking-tight text-balance text-text-primary normal-case wrap-anywhere"
              >
                {greetingName
                  ? `How can I help, ${greetingName}?`
                  : 'How can I help?'}
              </Heading>
              <Text
                tone="secondary"
                className={cn(
                  'mx-auto mt-3 max-w-72 text-center text-sm leading-6 text-balance',
                  density === 'compact' && 'mt-2',
                )}
              >
                Ask about a finding or refine your report.
              </Text>
              {suggestions.length > 0 && (
                <>
                  <Text
                    tone="secondary"
                    className={cn(
                      'mt-8 mb-2 text-xs leading-5 font-semibold',
                      density === 'compact' && 'mt-5',
                    )}
                  >
                    Suggested questions
                  </Text>
                  <SuggestionChips
                    suggestions={suggestions}
                    density={density}
                    disabled={busy}
                    onSuggestionSelect={handleSuggestionSelect}
                  />
                </>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <AssistantMessage
                key={message.id}
                message={message}
                density={density}
                retryDisabled={busy}
                onCitationClick={onCitationClick}
                onRetry={handleRetry}
              />
            ))
          )}
        </div>
      </div>
      <footer className="relative shrink-0 border-t border-border-subtle px-4 py-3">
        {showLatest && (
          <IconButton
            aria-label="Scroll to latest response"
            title="Scroll to latest response"
            className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full border border-border-default bg-bg-surface shadow-sm focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface"
            onClick={handleScrollToLatest}
          >
            <ArrowDown size={18} aria-hidden="true" />
          </IconButton>
        )}
        <Composer
          textareaRef={textareaRef}
          placeholder="Ask about this report..."
          value={value}
          status={busy ? 'streaming' : status}
          onValueChange={onValueChange}
          onSubmit={onSubmit}
          onStop={onStop}
        />
      </footer>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </section>
  );
}
