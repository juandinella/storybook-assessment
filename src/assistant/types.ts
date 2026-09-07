export type CitationKind = 'document' | 'section' | 'note';

export type Citation = {
  id: string;
  title: string;
  kind: CitationKind;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  status?: 'done' | 'streaming' | 'error';
  /** A stopped response is partial, not a failed or completed answer. */
  interrupted?: boolean;
};

export type AssistantStatus = 'idle' | 'streaming' | 'error';

export type AssistantDensity = 'comfortable' | 'compact';

export type ComposerProps = {
  /** Controlled draft. Keep it editable during generation. */
  value: string;
  /** Request availability; streaming replaces Send with Stop. */
  status: AssistantStatus;
  /** Reports draft edits without changing conversation state. */
  onValueChange: (value: string) => void;
  /** Requests one non-empty submission. The host accepts and clears the draft. */
  onSubmit: () => void;
  /** Requests cancellation. The host preserves partial text and the next draft. */
  onStop: () => void;
};

export type SuggestionChipsProps = {
  suggestions: readonly string[];
  onSuggestionSelect: (prompt: string) => void;
  disabled?: boolean;
};

export type AssistantMessageProps = {
  message: Message;
  onRetry: (messageId: string) => void;
  onCitationClick: (citation: Citation) => void;
  retryDisabled?: boolean;
  density?: AssistantDensity;
};

export type AssistantPanelProps = ComposerProps & {
  /** Immutable conversation snapshots owned by the consumer. */
  messages: readonly Message[];
  /** Full prompts offered before the first turn. */
  suggestions: readonly string[];
  /** Retries this failed assistant ID in place; unavailable during generation. */
  onRetry: (messageId: string) => void;
  /** Requests immediate submission of the exact prompt, not draft population. */
  onSuggestionSelect: (prompt: string) => void;
  /** Reports the source object; the host decides how to inspect it. */
  onCitationClick: (citation: Citation) => void;
  /** Report context shown in the stationary header. */
  reportTitle: string;
  /** Optional first name used in the empty-state welcome. */
  greetingName?: string;
  /** Reduces spacing without reducing text size or action targets. */
  density?: AssistantDensity;
  /** Host styling. Provide a bounded-height parent for independent thread scrolling. */
  className?: string;
};
