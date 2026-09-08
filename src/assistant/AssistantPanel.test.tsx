import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { denseThread, sampleReport, sampleSuggestions } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import type { AssistantPanelProps } from './types';

describe('AssistantPanel', () => {
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
        value: sampleSuggestions[0],
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
      ).toHaveValue(sampleSuggestions[0]);
      expect(props.onSubmit).not.toHaveBeenCalled();

      height = 1200;
      rerender(<AssistantPanel {...props} messages={[...denseThread]} />);
      expect(thread.scrollTop).toBe(height);
    },
  );

  it('keeps the resize observer when messages are appended and disconnects it on cleanup', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const ResizeObserverMock = vi.fn(function () {
      return { observe, disconnect };
    });
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    try {
      const props: AssistantPanelProps = {
        messages: denseThread.slice(0, 2),
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
      const { rerender, unmount } = render(<AssistantPanel {...props} />);
      expect(ResizeObserverMock).toHaveBeenCalledTimes(1);
      expect(observe).toHaveBeenCalledTimes(2);

      rerender(<AssistantPanel {...props} messages={denseThread} />);
      expect(ResizeObserverMock).toHaveBeenCalledTimes(1);
      expect(disconnect).not.toHaveBeenCalled();

      rerender(<AssistantPanel {...props} messages={[]} />);
      expect(ResizeObserverMock).toHaveBeenCalledTimes(2);
      expect(disconnect).toHaveBeenCalledTimes(1);

      unmount();
      expect(disconnect).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

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
        value: sampleSuggestions[0],
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
      expect(input).toHaveValue(sampleSuggestions[0]);
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
