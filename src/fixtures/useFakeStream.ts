import { useCallback, useEffect, useRef, useState } from 'react';

export type FakeStreamStatus = 'idle' | 'streaming' | 'done';

export type UseFakeStreamOptions = {
  text: string;
  intervalMs?: number;
};

export function useFakeStream({ text, intervalMs = 30 }: UseFakeStreamOptions) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<FakeStreamStatus>('idle');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setStatus((current) => (current === 'streaming' ? 'done' : current));
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    indexRef.current = 0;
    setContent('');
    setStatus('streaming');
    timerRef.current = setInterval(() => {
      indexRef.current += 1;
      const next = text.slice(0, indexRef.current);
      setContent(next);
      if (indexRef.current >= text.length) {
        clearTimer();
        setStatus('done');
      }
    }, intervalMs);
  }, [clearTimer, intervalMs, text]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { content, status, start, stop };
}
