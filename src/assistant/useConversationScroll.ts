import {
  type KeyboardEvent,
  type RefObject,
  type UIEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { AssistantDensity, Message } from './types';

type ConversationScrollOptions = {
  panelRef: RefObject<HTMLElement | null>;
  messages: readonly Message[];
  density: AssistantDensity;
  autoScrollOnSubmit: boolean;
};

export function useConversationScroll({
  panelRef,
  messages,
  density,
  autoScrollOnSubmit,
}: ConversationScrollOptions) {
  const threadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const smoothScrolling = useRef(false);
  const previousIds = useRef(new Set<string>());
  const [showLatest, setShowLatest] = useState(false);
  const hasMessages = messages.length > 0;

  const updateFollowState = useCallback(
    (nearBottom: boolean) => {
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
    },
    [panelRef],
  );

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
      previousIds.current.size > 0 &&
      messages.some(
        (message) =>
          message.role === 'user' && !previousIds.current.has(message.id),
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
    previousIds.current = new Set(messages.map((message) => message.id));
  }, [messages]);

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

  function cancelSmoothScroll() {
    const thread = threadRef.current;
    if (!smoothScrolling.current || !thread) return;
    smoothScrolling.current = false;
    thread.scrollTo({ top: thread.scrollTop, behavior: 'instant' });
    updateFollowState(false);
  }

  function handleThreadScroll(event: UIEvent<HTMLDivElement>) {
    if (!hasMessages || smoothScrolling.current) return;
    const node = event.currentTarget;
    const nearBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight <= 48;
    updateFollowState(nearBottom);
  }

  function handleThreadScrollEnd() {
    if (!smoothScrolling.current) return;
    smoothScrolling.current = false;
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
    updateFollowState(true);
  }

  function handleThreadKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
  }

  function handleScrollToLatest() {
    const thread = threadRef.current;
    if (!thread) return;
    updateFollowState(true);
    thread.scrollTop = thread.scrollHeight;
    thread.focus({ preventScroll: true });
  }

  return {
    threadRef,
    contentRef,
    showLatest,
    cancelSmoothScroll,
    handleThreadScroll,
    handleThreadScrollEnd,
    handleThreadKeyDown,
    handleScrollToLatest,
  };
}
