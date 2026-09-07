import { useState } from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleSuggestions } from '@/fixtures';
import { Composer } from './Composer';

describe('Composer', () => {
  it.each(['click', 'Enter'] as const)('submits once via %s', async (method) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Composer value={sampleSuggestions[0]} status="idle" onValueChange={vi.fn()} onSubmit={onSubmit} onStop={vi.fn()} />);

    if (method === 'click') await user.click(screen.getByRole('button', { name: 'Send message' }));
    else {
      await user.click(screen.getByRole('textbox', { name: 'Message to assistant' }));
      await user.keyboard('{Enter}');
    }

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith();
    expect(screen.getByRole('textbox', { name: 'Message to assistant' })).toHaveFocus();
  });

  it('keeps streaming drafts editable, blocks submission, and calls Stop once', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const onValueChange = vi.fn();
    render(<Composer value={sampleSuggestions[0]} status="streaming" onValueChange={onValueChange} onSubmit={onSubmit} onStop={onStop} />);
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });

    expect(input).toBeEnabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: sampleSuggestions[1] } });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(sampleSuggestions[1]);
    await user.click(input);
    await user.keyboard('{Enter}');
    fireEvent.submit(screen.getByRole('form', { name: 'Assistant composer' }));
    await user.click(screen.getByRole('button', { name: 'Stop response' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledExactlyOnceWith();
    expect(input).toHaveFocus();
  });

  it.each(['', ' \t\n '])('rejects an empty or whitespace-only draft (%j)', async (value) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Composer value={value} status="idle" onValueChange={vi.fn()} onSubmit={onSubmit} onStop={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Send message' }));
    await user.click(screen.getByRole('textbox', { name: 'Message to assistant' }));
    await user.keyboard('{Enter}');
    fireEvent.submit(screen.getByRole('form', { name: 'Assistant composer' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('inserts a newline with Shift+Enter instead of submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Draft() {
      const [value, setValue] = useState<string>(sampleSuggestions[0]);
      return <Composer value={value} status="idle" onValueChange={setValue} onSubmit={onSubmit} onStop={vi.fn()} />;
    }
    render(<Draft />);
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });

    await user.click(input);
    await user.keyboard('{End}{Shift>}{Enter}{/Shift}');

    expect(input).toHaveValue(`${sampleSuggestions[0]}\n`);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([{ isComposing: true }, { keyCode: 229 }])('does not intercept IME confirmation (%j)', (composition) => {
    const onSubmit = vi.fn();
    render(<Composer value={sampleSuggestions[0]} status="idle" onValueChange={vi.fn()} onSubmit={onSubmit} onStop={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: 'Message to assistant' });
    const event = createEvent.keyDown(input, { key: 'Enter', code: 'Enter', ...composition });

    fireEvent(input, event);

    expect(event.defaultPrevented).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
