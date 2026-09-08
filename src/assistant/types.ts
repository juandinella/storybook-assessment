export type CitationKind = 'document' | 'section' | 'note';

export type Citation = {
  id: string;
  title: string;
  kind: CitationKind;
};

export type Message = {
  /** Keep IDs stable and unique within the conversation for rendering, retries, and change detection. */
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  status?: 'done' | 'streaming' | 'error';
  /** Shows stopped-response feedback for assistant turns; does not cancel generation or override status. */
  interrupted?: boolean;
};

export type AssistantStatus = 'idle' | 'streaming' | 'error';

export type AssistantDensity = 'comfortable' | 'compact';

export type ComposerProps = {
  /** Controlled draft; remains editable while streaming. */
  value: string;
  /** Streaming replaces Send with Stop and blocks submission; idle and error allow sending non-blank drafts. */
  status: AssistantStatus;
  /** Reports the full draft after an edit; the consumer must update value. */
  onValueChange: (value: string) => void;
  /** Requests submission of the current non-blank draft when not streaming; does not clear value. */
  onSubmit: () => void;
  /** Requests cancellation; the consumer must stop generation and update the controlled state. */
  onStop: () => void;
};

export type SuggestionChipsProps = {
  /** Prompts must be unique: each string is also used as its React key. */
  suggestions: readonly string[];
  /** Reports the selected prompt unchanged; does not submit a request or edit a draft. */
  onSuggestionSelect: (prompt: string) => void;
  disabled?: boolean;
  /** Defaults to comfortable. Compact reduces spacing between buttons without changing their sizing. */
  density?: AssistantDensity;
};

export type AssistantMessageProps = {
  message: Message;
  /** Requests retry of the failed assistant message by ID; does not change the message. */
  onRetry: (messageId: string) => void;
  /** Reports the selected citation object; the consumer handles source inspection or navigation. */
  onCitationClick: (citation: Citation) => void;
  /** Disables the Retry button without hiding it. Defaults to false. */
  retryDisabled?: boolean;
  /** Defaults to comfortable. Compact reduces user-bubble padding and content spacing, not typography or button sizing. */
  density?: AssistantDensity;
};

/**
 * Controlled sidebar. Provide a bounded-height parent for independent thread scrolling.
 * A streaming status or message blocks Send, Retry, and suggestions while keeping the draft editable.
 */
export type AssistantPanelProps = ComposerProps & {
  /** Consumer-owned conversation. Replace the array and changed message objects so scrolling and announcements can detect updates. */
  messages: readonly Message[];
  /** Unique prompts shown only when messages is empty. */
  suggestions: readonly string[];
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
