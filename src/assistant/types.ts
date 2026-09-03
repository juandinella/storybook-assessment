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
};

export type AssistantStatus = 'idle' | 'streaming' | 'error';
