import { useEffect, useRef, useState } from 'react';
import {
  clinician,
  denseThread,
  errorMessage,
  sampleCitations,
  sampleMessages,
  sampleReport,
  sampleSuggestions,
  useFakeStream,
} from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import type { AssistantDensity, Citation, Message } from './types';

export type DemoScenario =
  | 'empty'
  | 'streaming'
  | 'error'
  | 'citations'
  | 'dense';
export type AssistantDemoProps = {
  scenario: DemoScenario;
  density?: AssistantDensity;
  reportTitle?: string;
  greetingName?: string;
  autoScrollOnSubmit?: boolean;
};

function initialMessages(scenario: DemoScenario): Message[] {
  switch (scenario) {
    case 'empty':
      return [];
    case 'error':
      return [sampleMessages[0], errorMessage];
    case 'dense':
      return denseThread;
    case 'streaming':
      return [
        sampleMessages[0],
        {
          id: 'demo-stream',
          role: 'assistant',
          content: '',
          status: 'streaming',
        },
      ];
    case 'citations':
      return [
        sampleMessages[0],
        { ...sampleMessages[1], citations: sampleCitations },
      ];
  }
}

/** Story-only consumer: no backend, persistence, or clinical inference. Remount to reset a scenario. */
export function AssistantDemo({
  scenario,
  density = 'comfortable',
  reportTitle = sampleReport.title,
  greetingName = clinician.firstName,
  autoScrollOnSubmit = false,
}: AssistantDemoProps) {
  const [history, setHistory] = useState(() => initialMessages(scenario));
  const [value, setValue] = useState('');
  const [activeId, setActiveId] = useState<string | null>(
    scenario === 'streaming' ? 'demo-stream' : null,
  );
  const [selectedSource, setSelectedSource] = useState<Citation | null>(null);
  const nextId = useRef(0);
  const locked = useRef(scenario === 'streaming');
  const stream = useFakeStream({
    text: sampleMessages[1].content,
    intervalMs: 55,
  });
  const { start, stop, status: streamStatus } = stream;

  useEffect(() => {
    if (scenario === 'streaming') start();
  }, [scenario, start]);

  useEffect(() => {
    if (streamStatus === 'done') locked.current = false;
  }, [streamStatus]);

  const generating = activeId !== null && streamStatus !== 'done';
  const messages: Message[] = history.map((message) =>
    message.id === activeId
      ? {
          ...message,
          content: stream.content,
          status: generating ? 'streaming' : 'done',
          citations: generating ? undefined : sampleCitations,
          interrupted: false,
        }
      : message,
  );

  function submitPrompt(prompt: string) {
    if (locked.current || !prompt.trim()) return;
    locked.current = true;
    const id = `demo-answer-${++nextId.current}`;
    setHistory([
      ...messages,
      {
        id: `demo-question-${nextId.current}`,
        role: 'user',
        content: prompt,
        status: 'done',
      },
      { id, role: 'assistant', content: '', status: 'streaming' },
    ]);
    setValue('');
    setActiveId(id);
    start();
  }

  return (
    <div className="flex h-dvh min-h-110 flex-col items-center justify-center bg-bg-page px-3 py-5 sm:px-6">
      <div className="flex min-h-0 w-full max-w-105 flex-1 flex-col justify-center gap-3">
        <AssistantPanel
          messages={messages}
          value={value}
          onValueChange={setValue}
          className="max-h-190 flex-1 rounded-md shadow-sm"
          status={
            generating
              ? 'streaming'
              : messages.some((message) => message.status === 'error')
                ? 'error'
                : 'idle'
          }
          reportTitle={reportTitle}
          greetingName={greetingName}
          autoScrollOnSubmit={autoScrollOnSubmit}
          density={density}
          suggestions={sampleSuggestions}
          onSubmit={() => submitPrompt(value)}
          onSuggestionSelect={submitPrompt}
          onStop={() => {
            if (!generating) return;
            stop();
            setHistory(
              messages.map((message) =>
                message.id === activeId
                  ? {
                      ...message,
                      status: 'done',
                      interrupted: true,
                      citations: undefined,
                    }
                  : message,
              ),
            );
            setActiveId(null);
            locked.current = false;
          }}
          onRetry={(id) => {
            if (
              locked.current ||
              !messages.some(
                (message) =>
                  message.id === id &&
                  message.role === 'assistant' &&
                  message.status === 'error',
              )
            )
              return;
            locked.current = true;
            setHistory(
              messages.map((message) =>
                message.id === id
                  ? {
                      ...message,
                      content: '',
                      status: 'streaming',
                      citations: undefined,
                      interrupted: false,
                    }
                  : message,
              ),
            );
            setActiveId(id);
            start();
          }}
          onCitationClick={setSelectedSource}
        />
        <div
          role="status"
          aria-label="Source selection"
          aria-live="polite"
          aria-atomic="true"
          tabIndex={selectedSource ? 0 : undefined}
          className="scrollbar-thin h-10 shrink-0 overflow-y-auto text-center text-xs leading-5 text-text-secondary wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {selectedSource && `Selected source: ${selectedSource.title}`}
        </div>
      </div>
    </div>
  );
}
