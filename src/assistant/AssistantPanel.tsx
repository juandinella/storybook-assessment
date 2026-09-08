import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
import type { AssistantPanelProps, Message } from './types';

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
  const threadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const smoothScrolling = useRef(false);
  const previous = useRef(new Map<string, Message>());
  const [announcement, setAnnouncement] = useState('');
  const [showLatest, setShowLatest] = useState(false);
  const hasMessages = messages.length > 0;
  const busy =
    status === 'streaming' ||
    messages.some((message) => message.status === 'streaming');

  function focusDraft() {
    panelRef.current?.querySelector('textarea')?.focus({ preventScroll: true });
  }

  const updateFollowState = useCallback((nearBottom: boolean) => {
    following.current = nearBottom;
    const thread = threadRef.current;
    if (nearBottom && thread) {
      const button = panelRef.current?.querySelector(
        '[aria-label="Scroll to latest response"]',
      );
      if (button === thread.ownerDocument.activeElement)
        thread.focus({ preventScroll: true });
    }
    setShowLatest(!nearBottom);
  }, []);

  function cancelSmoothScroll() {
    const thread = threadRef.current;
    if (!smoothScrolling.current || !thread) return;
    smoothScrolling.current = false;
    thread.scrollTo({ top: thread.scrollTop, behavior: 'instant' });
    updateFollowState(false);
  }

  useLayoutEffect(() => {
    if (!hasMessages) {
      smoothScrolling.current = false;
      // Recover focus before removing the arrow, without painting it over the empty state.
      updateFollowState(true);
      return;
    }
    const thread = threadRef.current;
    if (!thread) return;
    const newUserTurn =
      previous.current.size > 0 &&
      messages.some(
        (message) =>
          message.role === 'user' && !previous.current.has(message.id),
      );
    if (autoScrollOnSubmit && newUserTurn && !following.current) {
      const reducedMotion = thread.ownerDocument.defaultView?.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      updateFollowState(true);
      if (
        !reducedMotion &&
        thread.scrollHeight - thread.clientHeight - thread.scrollTop > 1
      ) {
        smoothScrolling.current = true;
        thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
        return;
      }
    }
    // Streaming and resize must not interrupt the user-initiated smooth scroll.
    if (following.current && !smoothScrolling.current)
      thread.scrollTop = thread.scrollHeight;
  }, [messages, density, hasMessages, autoScrollOnSubmit, updateFollowState]);

  useEffect(() => {
    const thread = threadRef.current;
    const content = contentRef.current;
    if (!thread || !content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (!hasMessages || smoothScrolling.current) return;
      const nearBottom =
        thread.scrollHeight - thread.scrollTop - thread.clientHeight <= 48;
      const shouldFollow = following.current || nearBottom;
      updateFollowState(shouldFollow);
      if (shouldFollow) thread.scrollTop = thread.scrollHeight;
    });
    observer.observe(thread);
    observer.observe(content);
    return () => observer.disconnect();
  }, [hasMessages, updateFollowState]);

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
        onScroll={(event) => {
          if (!hasMessages || smoothScrolling.current) return;
          const node = event.currentTarget;
          const nearBottom =
            node.scrollHeight - node.scrollTop - node.clientHeight <= 48;
          updateFollowState(nearBottom);
        }}
        onScrollEnd={() => {
          if (!smoothScrolling.current) return;
          smoothScrolling.current = false;
          const thread = threadRef.current;
          if (thread) thread.scrollTop = thread.scrollHeight;
          updateFollowState(true);
        }}
        onWheel={cancelSmoothScroll}
        onTouchStart={cancelSmoothScroll}
        onPointerDown={cancelSmoothScroll}
        onKeyDown={(event) => {
          if (
            [
              'ArrowUp',
              'ArrowDown',
              'PageUp',
              'PageDown',
              'Home',
              'End',
              ' ',
            ].includes(event.key)
          )
            cancelSmoothScroll();
        }}
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
                    onSuggestionSelect={(prompt) => {
                      if (busy) return;
                      focusDraft();
                      onSuggestionSelect(prompt);
                    }}
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
                onRetry={(id) => {
                  if (busy) return;
                  focusDraft();
                  onRetry(id);
                }}
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
            onClick={() => {
              const thread = threadRef.current;
              if (!thread) return;
              updateFollowState(true);
              thread.scrollTop = thread.scrollHeight;
              thread.focus({ preventScroll: true });
            }}
          >
            <ArrowDown size={18} aria-hidden="true" />
          </IconButton>
        )}
        <Composer
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
