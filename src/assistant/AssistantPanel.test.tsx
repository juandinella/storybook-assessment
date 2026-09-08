import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { denseThread, sampleReport, sampleSuggestions } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';

type AssistantPanelProps = ComponentProps<typeof AssistantPanel>;

describe('AssistantPanel', () => {
  it.each([
    { autoScrollOnSubmit: undefined, reducedMotion: false },
    { autoScrollOnSubmit: true, reducedMotion: false },
    { autoScrollOnSubmit: true, reducedMotion: true },
  ])(
    'handles submission scrolling with %j',
    ({ autoScrollOnSubmit, reducedMotion }) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: reducedMotion })),
      );
      let notifyResize = () => {};
      vi.stubGlobal(
        'ResizeObserver',
        vi.fn(function (callback: () => void) {
          notifyResize = callback;
          return { observe: vi.fn(), disconnect: vi.fn() };
        }),
      );
      try {
        const props: AssistantPanelProps = {
          messages: denseThread,
          status: 'idle',
          value: sampleSuggestions[0].text,
          reportTitle: sampleReport.title,
          suggestions: sampleSuggestions,
          onValueChange: vi.fn(),
          onSubmit: vi.fn(),
          onStop: vi.fn(),
          onRetry: vi.fn(),
          onSuggestionSelect: vi.fn(),
          onCitationClick: vi.fn(),
          autoScrollOnSubmit,
        };
        const { rerender } = render(<AssistantPanel {...props} />);
        const thread = screen.getByRole('region', { name: 'Conversation' });
        const input = screen.getByRole('textbox', {
          name: 'Message to assistant',
        });
        let height = 1000;
        const scrollTo = vi.fn();
        Object.defineProperties(thread, {
          scrollHeight: { get: () => height },
          clientHeight: { get: () => 200 },
          scrollTo: { value: scrollTo },
        });
        thread.scrollTop = 100;
        fireEvent.scroll(thread);
        input.focus();
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(props.onSubmit).toHaveBeenCalledOnce();
        // A submission request alone does not mean the host accepted the turn.
        rerender(<AssistantPanel {...props} messages={[...denseThread]} />);
        expect(thread.scrollTop).toBe(100);
        expect(scrollTo).not.toHaveBeenCalled();

        const messages = [
          ...denseThread,
          {
            id: 'new-user',
            role: 'user' as const,
            content: sampleSuggestions[0].text,
          },
          {
            id: 'new-answer',
            role: 'assistant' as const,
            content: '',
            status: 'streaming' as const,
          },
        ];
        rerender(
          <AssistantPanel {...props} messages={messages} status="streaming" />,
        );
        if (autoScrollOnSubmit && !reducedMotion) {
          expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
            top: height,
            behavior: 'smooth',
          });
          thread.scrollTop = 300;
          fireEvent.scroll(thread);
        } else {
          expect(scrollTo).not.toHaveBeenCalled();
          expect(thread.scrollTop).toBe(autoScrollOnSubmit ? height : 100);
        }
        height = 1200;
        rerender(
          <AssistantPanel
            {...props}
            messages={messages.map((message) =>
              message.id === 'new-answer'
                ? { ...message, content: 'Arriving response' }
                : message,
            )}
            status="streaming"
          />,
        );
        act(() => notifyResize());
        if (autoScrollOnSubmit && !reducedMotion) {
          expect(thread.scrollTop).toBe(300);
          expect(scrollTo).toHaveBeenCalledTimes(1);
          fireEvent(thread, new Event('scrollend'));
        }
        expect(thread.scrollTop).toBe(autoScrollOnSubmit ? height : 100);
        expect(input).toHaveFocus();
        expect(
          Boolean(
            screen.queryByRole('button', {
              name: 'Scroll to latest response',
            }),
          ),
        ).toBe(!autoScrollOnSubmit);
        thread.scrollTop = 100;
        fireEvent.scroll(thread);
        height = 1400;
        rerender(
          <AssistantPanel
            {...props}
            messages={[...messages]}
            status="streaming"
          />,
        );
        expect(thread.scrollTop).toBe(100);
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );

  it.each(['wheel', 'touchStart', 'pointerDown', 'keyDown'] as const)(
    'lets %s interrupt smooth submission scrolling without resuming on streamed output',
    (event) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: false })),
      );
      try {
        const props: AssistantPanelProps = {
          messages: denseThread,
          status: 'idle',
          value: '',
          reportTitle: sampleReport.title,
          suggestions: sampleSuggestions,
          onValueChange: vi.fn(),
          onSubmit: vi.fn(),
          onStop: vi.fn(),
          onRetry: vi.fn(),
          onSuggestionSelect: vi.fn(),
          onCitationClick: vi.fn(),
          autoScrollOnSubmit: true,
        };
        const { rerender } = render(<AssistantPanel {...props} />);
        const thread = screen.getByRole('region', { name: 'Conversation' });
        const scrollTo = vi.fn();
        Object.defineProperties(thread, {
          scrollHeight: { value: 1000 },
          clientHeight: { value: 200 },
          scrollTo: { value: scrollTo },
        });
        thread.scrollTop = 100;
        fireEvent.scroll(thread);
        const messages = [
          ...denseThread,
          { id: 'new-user', role: 'user' as const, content: 'Question' },
        ];
        rerender(<AssistantPanel {...props} messages={messages} />);
        expect(scrollTo).toHaveBeenCalledWith({
          top: 1000,
          behavior: 'smooth',
        });
        thread.scrollTop = 300;
        fireEvent[event](thread, { key: 'PageUp' });
        expect(scrollTo).toHaveBeenLastCalledWith({
          top: 300,
          behavior: 'instant',
        });
        fireEvent(thread, new Event('scrollend'));
        rerender(
          <AssistantPanel
            {...props}
            messages={[
              ...messages,
              {
                id: 'answer',
                role: 'assistant',
                content: 'Response',
                status: 'streaming',
              },
            ]}
          />,
        );
        expect(thread.scrollTop).toBe(300);
        expect(
          screen.getByRole('button', { name: 'Scroll to latest response' }),
        ).toBeVisible();
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );

  it('follows output near the bottom but preserves the position when reading earlier turns', () => {
    const props: AssistantPanelProps = {
      messages: denseThread,
      status: 'idle',
      value: '',
      reportTitle: sampleReport.title,
      suggestions: sampleSuggestions,
      onValueChange: vi.fn(),
      onSubmit: vi.fn(),
      onStop: vi.fn(),
      onRetry: vi.fn(),
      onSuggestionSelect: vi.fn(),
      onCitationClick: vi.fn(),
    };
    const { rerender } = render(<AssistantPanel {...props} />);
    const thread = screen.getByRole('region', { name: 'Conversation' });
    let height = 1000;
    Object.defineProperties(thread, {
      scrollHeight: { get: () => height },
      clientHeight: { get: () => 200 },
    });
    const messages = [...denseThread];

    rerender(<AssistantPanel {...props} messages={messages} />);
    expect(thread.scrollTop).toBe(height);
    expect(
      screen.queryByRole('button', { name: 'Scroll to latest response' }),
    ).not.toBeInTheDocument();

    thread.scrollTop = 100;
    fireEvent.scroll(thread);
    height = 1200;
    rerender(<AssistantPanel {...props} messages={[...messages]} />);
    expect(thread.scrollTop).toBe(100);
    const latest = screen.getByRole('button', {
      name: 'Scroll to latest response',
    });
    latest.focus();

    thread.scrollTop = height - thread.clientHeight - 24;
    fireEvent.scroll(thread);
    expect(
      screen.queryByRole('button', { name: 'Scroll to latest response' }),
    ).not.toBeInTheDocument();
    expect(thread).toHaveFocus();
    height = 1400;
    rerender(<AssistantPanel {...props} messages={[...messages]} />);
    expect(thread.scrollTop).toBe(height);
  });

  it.each(['click', 'Enter'] as const)(
    'returns to the bottom via %s, restores focus, and resumes following output',
    async (method) => {
      const user = userEvent.setup();
      const props: AssistantPanelProps = {
        messages: denseThread,
        status: 'idle',
        value: sampleSuggestions[0].text,
        reportTitle: sampleReport.title,
        suggestions: sampleSuggestions,
        onValueChange: vi.fn(),
        onSubmit: vi.fn(),
        onStop: vi.fn(),
        onRetry: vi.fn(),
        onSuggestionSelect: vi.fn(),
        onCitationClick: vi.fn(),
      };
      const { rerender } = render(<AssistantPanel {...props} />);
      const thread = screen.getByRole('region', { name: 'Conversation' });
      let height = 1000;
      Object.defineProperties(thread, {
        scrollHeight: { get: () => height },
        clientHeight: { get: () => 200 },
      });
      thread.scrollTop = 100;
      fireEvent.scroll(thread);
      const button = screen.getByRole('button', {
        name: 'Scroll to latest response',
      });

      if (method === 'click') await user.click(button);
      else {
        button.focus();
        await user.keyboard('{Enter}');
      }

      expect(thread.scrollTop).toBe(height);
      expect(thread).toHaveFocus();
      expect(button).not.toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Message to assistant' }),
      ).toHaveValue(sampleSuggestions[0].text);
      expect(props.onSubmit).not.toHaveBeenCalled();

      height = 1200;
      rerender(<AssistantPanel {...props} messages={[...denseThread]} />);
      expect(thread.scrollTop).toBe(height);
    },
  );

  it('reconciles resize without a scroll event and resumes following only near the bottom', () => {
    let notifyResize = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function (callback: () => void) {
        notifyResize = callback;
        return { observe: vi.fn(), disconnect: vi.fn() };
      }),
    );

    try {
      const props: AssistantPanelProps = {
        messages: denseThread,
        status: 'idle',
        value: '',
        reportTitle: sampleReport.title,
        suggestions: sampleSuggestions,
        onValueChange: vi.fn(),
        onSubmit: vi.fn(),
        onStop: vi.fn(),
        onRetry: vi.fn(),
        onSuggestionSelect: vi.fn(),
        onCitationClick: vi.fn(),
      };
      const { rerender } = render(<AssistantPanel {...props} />);
      const thread = screen.getByRole('region', { name: 'Conversation' });
      let contentHeight = 1000;
      let viewportHeight = 200;
      Object.defineProperties(thread, {
        scrollHeight: { get: () => contentHeight },
        clientHeight: { get: () => viewportHeight },
      });
      thread.scrollTop = 720;
      fireEvent.scroll(thread);
      const button = screen.getByRole('button', {
        name: 'Scroll to latest response',
      });

      contentHeight = 1100;
      act(() => notifyResize());
      expect(thread.scrollTop).toBe(720);
      expect(button).toBeVisible();

      button.focus();
      viewportHeight = 360;
      act(() => notifyResize());
      expect(button).not.toBeInTheDocument();
      expect(thread).toHaveFocus();
      expect(thread.scrollTop).toBe(contentHeight);

      contentHeight = 1300;
      rerender(<AssistantPanel {...props} messages={[...denseThread]} />);
      expect(thread.scrollTop).toBe(contentHeight);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([true, false])(
    'resets an emptied conversation without losing or stealing focus (arrow focused: %s)',
    (arrowFocused) => {
      const props: AssistantPanelProps = {
        messages: denseThread,
        status: 'idle',
        value: sampleSuggestions[0].text,
        reportTitle: sampleReport.title,
        suggestions: sampleSuggestions,
        onValueChange: vi.fn(),
        onSubmit: vi.fn(),
        onStop: vi.fn(),
        onRetry: vi.fn(),
        onSuggestionSelect: vi.fn(),
        onCitationClick: vi.fn(),
      };
      const { rerender } = render(<AssistantPanel {...props} />);
      const thread = screen.getByRole('region', { name: 'Conversation' });
      const input = screen.getByRole('textbox', {
        name: 'Message to assistant',
      });
      let height = 1000;
      Object.defineProperties(thread, {
        scrollHeight: { get: () => height },
        clientHeight: { get: () => 200 },
      });
      thread.scrollTop = 100;
      fireEvent.scroll(thread);
      const button = screen.getByRole('button', {
        name: 'Scroll to latest response',
      });
      if (arrowFocused) button.focus();
      else input.focus();

      height = 200;
      rerender(<AssistantPanel {...props} messages={[]} />);
      expect(button).not.toBeInTheDocument();
      expect(arrowFocused ? thread : input).toHaveFocus();
      expect(input).toHaveValue(sampleSuggestions[0].text);
      expect(screen.getByRole('status')).toBeEmptyDOMElement();

      height = 1000;
      rerender(<AssistantPanel {...props} messages={denseThread} />);
      expect(thread.scrollTop).toBe(height);
      expect(
        screen.queryByRole('button', { name: 'Scroll to latest response' }),
      ).not.toBeInTheDocument();
    },
  );
});
