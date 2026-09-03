import type { Citation, Message } from '@/assistant/types';

export const clinician = {
  firstName: 'Alex',
  lastName: 'Rivera',
} as const;

export const sampleReport = {
  title: 'Sample neuropsych report',
  patientDisplayName: 'Jordan Lee (sample)',
  sections: ['History', 'Test results', 'Impression'],
} as const;

export const sampleCitations: Citation[] = [
  { id: 'cit-doc-1', title: 'Referral letter — sample.pdf', kind: 'document' },
  { id: 'cit-sec-1', title: 'Section: Test results', kind: 'section' },
  { id: 'cit-note-1', title: 'Session note — 12 Mar (sample)', kind: 'note' },
];

export const sampleSuggestions = [
  'Summarize the impression in two sentences',
  'Which scores support the attention finding?',
  'Rewrite the history in plainer language',
] as const;

export const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Which scores support the attention finding?',
    status: 'done',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      'Working memory and CPT omission scores are the main supports. Digit span is weaker than the rest of the battery.',
    citations: [sampleCitations[1], sampleCitations[0]],
    status: 'done',
  },
];

export const denseThread: Message[] = Array.from({ length: 10 }, (_, index) => {
  const isUser = index % 2 === 0;
  return {
    id: `dense-${index + 1}`,
    role: isUser ? 'user' : 'assistant',
    content: isUser
      ? `Sample question ${index / 2 + 1} about the report.`
      : `Sample answer ${Math.ceil(index / 2)} — not a real clinical opinion.`,
    status: 'done' as const,
  };
});

export const errorMessage: Message = {
  id: 'msg-error',
  role: 'assistant',
  content: 'The assistant could not finish this turn.',
  status: 'error',
};
