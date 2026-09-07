import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Heading, Text } from '@/primitives';
import { cn } from '@/lib/cn';
import { AssistantMessage } from './AssistantMessage';
import { Composer } from './Composer';
import { SuggestionChips } from './SuggestionChips';
import type { AssistantPanelProps, Message } from './types';

/** Controlled report sidebar. The host owns all conversation and generation state. */
export function AssistantPanel({
  messages, status, value, onValueChange, onSubmit, onStop, suggestions,
  onSuggestionSelect, onRetry, onCitationClick, reportTitle, greetingName,
  density = 'comfortable', className,
}: AssistantPanelProps) {
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const previous = useRef<readonly Message[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const busy = status === 'streaming' || messages.some((message) => message.status === 'streaming');

  function focusDraft() {
    panelRef.current?.querySelector('textarea')?.focus({ preventScroll: true });
  }

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (thread && messages.length > 0 && following.current) thread.scrollTop = thread.scrollHeight;
  }, [messages, density]);

  useEffect(() => {
    const thread = threadRef.current;
    const content = contentRef.current;
    if (!thread || !content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (messages.length > 0 && following.current) thread.scrollTop = thread.scrollHeight;
    });
    observer.observe(thread);
    observer.observe(content);
    return () => observer.disconnect();
  }, [messages.length]);

  useEffect(() => {
    // Compare turns by ID: a retried answer need not be the last message.
    const changed = messages.filter((message) => {
      const before = previous.current.find((item) => item.id === message.id);
      return message.role === 'assistant' &&
        (!before || before.status !== message.status || before.interrupted !== message.interrupted);
    });
    const turn = changed.at(-1);
    if (turn) {
      setAnnouncement(turn.interrupted ? 'Response stopped. Partial answer preserved.'
        : turn.status === 'streaming' ? 'Preparing response.'
        : turn.status === 'error' ? 'Response failed. Retry is available.'
        : 'Response complete.');
    }
    previous.current = messages;
  }, [messages]);

  return (
    <section ref={panelRef} aria-labelledby={headingId}
      className={cn('flex h-full min-h-0 w-full max-w-[420px] flex-col overflow-hidden border border-border-default bg-bg-surface', className)}>
      <header className="flex shrink-0 items-start gap-3 border-b border-border-subtle px-5 py-4">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-sage-surface text-accent">
          <BookOpen size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <Heading id={headingId} className="text-base leading-6">Report assistant</Heading>
          <Text tone="secondary" className="text-xs leading-5 [overflow-wrap:anywhere]">{reportTitle}</Text>
        </div>
      </header>
      <div ref={threadRef} role="region" aria-label="Conversation" tabIndex={0}
        onScroll={(event) => {
          const node = event.currentTarget;
          following.current = node.scrollHeight - node.scrollTop - node.clientHeight <= 48;
        }}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus">
        <div ref={contentRef} className={cn('flex flex-col gap-7 py-6', density === 'compact' && 'gap-5 py-4')}>
          {messages.length === 0 ? (
            <div>
              <Heading as="h3" className="text-base normal-case tracking-normal text-text-primary">
                {greetingName ? `How can I help, ${greetingName}?` : 'How can I help?'}
              </Heading>
              <Text tone="secondary" className="mt-2 mb-4 text-sm leading-6">
                Ask about a finding or refine a section of this report.
              </Text>
              <SuggestionChips suggestions={suggestions} disabled={busy}
                onSuggestionSelect={(prompt) => {
                  if (busy) return;
                  focusDraft();
                  onSuggestionSelect(prompt);
                }} />
            </div>
          ) : messages.map((message) => (
            <AssistantMessage key={message.id} message={message} density={density}
              retryDisabled={busy} onCitationClick={onCitationClick}
              onRetry={(id) => {
                if (busy) return;
                focusDraft();
                onRetry(id);
              }} />
          ))}
        </div>
      </div>
      <footer className="shrink-0 border-t border-border-subtle px-4 py-3">
        <Composer value={value} status={busy ? 'streaming' : status} onValueChange={onValueChange}
          onSubmit={onSubmit} onStop={onStop} />
        <Text tone="secondary" className="mt-2 text-center text-[11px] leading-4">
          Sample content. Review responses against their sources.
        </Text>
      </footer>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
    </section>
  );
}
