import {
  AlertCircle,
  FileText,
  NotebookPen,
  RotateCcw,
  TextQuote,
} from 'lucide-react';
import { Button } from '@/primitives/Button';
import { Text } from '@/primitives/Text';
import { cn } from '@/lib/cn';
import type { AssistantMessageProps, CitationKind } from './types';

const sourceTypes = {
  document: { label: 'Document', Icon: FileText },
  section: { label: 'Section', Icon: TextQuote },
  note: { label: 'Note', Icon: NotebookPen },
} satisfies Record<CitationKind, { label: string; Icon: typeof FileText }>;

export function AssistantMessage({
  message,
  onRetry,
  onCitationClick,
  retryDisabled = false,
  density = 'comfortable',
}: AssistantMessageProps) {
  const user = message.role === 'user';
  return (
    <article
      aria-label={user ? 'You' : 'Assistant'}
      data-message-id={message.id}
      className={cn(
        'min-w-0 wrap-anywhere',
        user && 'max-w-[90%] self-end rounded-md bg-bg-subtle px-4 py-3',
        user && density === 'compact' && 'px-3 py-2',
      )}
    >
      <Text
        className={cn(
          'mb-1.5 text-xs font-semibold',
          density === 'compact' && 'mb-1',
        )}
        tone={user ? 'primary' : 'secondary'}
      >
        {user ? 'You' : 'Assistant'}
      </Text>
      {message.content && (
        <Text className="whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </Text>
      )}
      {!user &&
        message.status === 'streaming' &&
        !message.content &&
        !message.interrupted && (
          <Text tone="secondary" className="text-sm leading-6">
            Preparing
          </Text>
        )}
      {!user && message.interrupted && (
        <Text
          tone="secondary"
          className={cn(
            'mt-2 text-xs leading-5',
            density === 'compact' && 'mt-1',
          )}
        >
          Response stopped.{' '}
          {message.content
            ? 'This answer is incomplete.'
            : 'No answer was generated.'}
        </Text>
      )}
      {!user && message.status === 'error' && (
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center justify-between gap-2',
            density === 'compact' && 'mt-2',
          )}
        >
          <p className="flex items-center gap-2 text-xs leading-5 font-medium text-danger">
            <AlertCircle size={14} aria-hidden="true" className="shrink-0" />
            Response failed
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={retryDisabled}
            onClick={() => onRetry(message.id)}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}
      {!user && !!message.citations?.length && (
        <div className={cn('mt-3', density === 'compact' && 'mt-2')}>
          <Text tone="secondary" className="mb-1 text-xs font-semibold">
            Sources ({message.citations.length})
          </Text>
          <ul
            aria-label="Sources"
            className={cn(
              'flex flex-col gap-0.5',
              density === 'compact' && 'gap-0',
            )}
          >
            {message.citations.map((citation) => {
              const { label, Icon } = sourceTypes[citation.kind];
              const sourceName = citation.title
                .toLowerCase()
                .startsWith(`${label.toLowerCase()}:`)
                ? citation.title
                : `${label}: ${citation.title}`;
              return (
                <li key={citation.id}>
                  <Button
                    variant="ghost"
                    aria-label={sourceName}
                    onClick={() => onCitationClick(citation)}
                    className="h-auto min-h-9 w-full items-start justify-start px-2.5 py-1.5 text-left text-sm leading-5 font-medium whitespace-normal"
                  >
                    <Icon
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-text-secondary"
                    />
                    <span className="min-w-0 wrap-anywhere">
                      {citation.title}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
