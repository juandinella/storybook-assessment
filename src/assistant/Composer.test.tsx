import { createRef, useState } from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleSuggestions } from '@/fixtures';
import { Composer } from './Composer';

describe('Composer', () => {
  it.each([
    [undefined, 'Ask a question...'],
    ['Ask about this report...', 'Ask about this report...'],
    ['', ''],
  ])('renders placeholder %j as %j', (placeholder, expected) => {
    render(
      <Composer
        value=""
        placeholder={placeholder}
        status="idle"
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onStop={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('textbox', { name: 'Message to assistant' }),
    ).toHaveAttribute('placeholder', expected);
  });

  it.each(['idle', 'streaming'] as const)(
    'connects an external ref and restores focus before the %s action callback',
    async (status) => {
      const user = userEvent.setup();
      const textareaRef = createRef<HTMLTextAreaElement>();
      const onAction = vi.fn(() => {
        expect(textareaRef.current).toHaveFocus();
      });
      const { unmount } = render(
        <Composer
          textareaRef={textareaRef}
          value={sampleSuggestions[0].text}
          status={status}
          onValueChange={vi.fn()}
          onSubmit={onAction}
          onStop={onAction}
        />,
      );
      const input = screen.getByRole('textbox', { name: 'Message to assistant' });
      expect(textareaRef.current).toBe(input);
      const focus = vi.spyOn(input, 'focus');

      await user.click(
        screen.getByRole('button', {
          name: status === 'streaming' ? 'Stop response' : 'Send message',
        }),
      );

      expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
      expect(onAction).toHaveBeenCalledExactlyOnceWith();
      unmount();
      expect(textareaRef.current).toBeNull();
    },
  );

  it.each(['click', 'Enter'] as const)(
    'submits once via %s',
    async (method) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <Composer
          value={sampleSuggestions[0].text}
          status="idle"
          onValueChange={vi.fn()}
          onSubmit={onSubmit}
          onStop={vi.fn()}
        />,
      );

      if (method === 'click')
        await user.click(screen.getByRole('button', { name: 'Send message' }));
      else {
        await user.click(
          screen.getByRole('textbox', { name: 'Message to assistant' }),
        );
        await user.keyboard('{Enter}');
      }

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith();
      expect(
        screen.getByRole('textbox', { name: 'Message to assistant' }),
      ).toHaveFocus();
    },
  );

  it('keeps streaming drafts editable, blocks submission, and calls Stop once', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Composer
        value={sampleSuggestions[0].text}
        status="streaming"
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onStop={onStop}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });

    expect(input).toBeEnabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(
      screen.queryByRole('button', { name: 'Send message' }),
    ).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: sampleSuggestions[1].text } });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
      sampleSuggestions[1].text,
    );
    await user.click(input);
    await user.keyboard('{Enter}');
    fireEvent.submit(screen.getByRole('form', { name: 'Assistant composer' }));
    await user.click(screen.getByRole('button', { name: 'Stop response' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledExactlyOnceWith();
    expect(input).toHaveFocus();
  });

  it.each(['', ' \t\n '])(
    'rejects an empty or whitespace-only draft (%j)',
    async (value) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <Composer
          value={value}
          status="idle"
          onValueChange={vi.fn()}
          onSubmit={onSubmit}
          onStop={vi.fn()}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Send message' }));
      await user.click(
        screen.getByRole('textbox', { name: 'Message to assistant' }),
      );
      await user.keyboard('{Enter}');
      fireEvent.submit(
        screen.getByRole('form', { name: 'Assistant composer' }),
      );

      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('inserts a newline with Shift+Enter instead of submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Draft() {
      const [value, setValue] = useState<string>(sampleSuggestions[0].text);
      return (
        <Composer
          value={value}
          status="idle"
          onValueChange={setValue}
          onSubmit={onSubmit}
          onStop={vi.fn()}
        />
      );
    }
    render(<Draft />);
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });

    await user.click(input);
    await user.keyboard('{End}{Shift>}{Enter}{/Shift}');

    expect(input).toHaveValue(`${sampleSuggestions[0].text}\n`);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not intercept Enter while the native event is composing', () => {
    const onSubmit = vi.fn();
    render(
      <Composer
        value={sampleSuggestions[0].text}
        status="idle"
        onValueChange={vi.fn()}
        onSubmit={onSubmit}
        onStop={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });
    const event = createEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
    });

    fireEvent(input, event);

    expect(event.defaultPrevented).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'protects IME confirmation when composition ends before Enter: %s',
    (endsBeforeEnter) => {
      vi.useFakeTimers();
      try {
        const onSubmit = vi.fn();
        render(
          <Composer
            value={sampleSuggestions[0].text}
            status="idle"
            onValueChange={vi.fn()}
            onSubmit={onSubmit}
            onStop={vi.fn()}
          />,
        );
        const input = screen.getByRole('textbox', {
          name: 'Message to assistant',
        });

        fireEvent.compositionStart(input);
        if (endsBeforeEnter) fireEvent.compositionEnd(input);
        const confirmation = createEvent.keyDown(input, {
          key: 'Enter',
          isComposing: false,
        });
        fireEvent(input, confirmation);

        expect(confirmation.defaultPrevented).toBe(false);
        expect(onSubmit).not.toHaveBeenCalled();

        if (!endsBeforeEnter) fireEvent.compositionEnd(input);
        vi.runOnlyPendingTimers();
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSubmit).toHaveBeenCalledExactlyOnceWith();
      } finally {
        vi.useRealTimers();
      }
    },
  );
});
