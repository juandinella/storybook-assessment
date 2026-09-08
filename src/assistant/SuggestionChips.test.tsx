import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  it('submits the exact selected prompt by click', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(
      <SuggestionChips
        suggestions={sampleSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: sampleSuggestions[0].text }),
    );
    expect(onSuggestionSelect).toHaveBeenCalledWith(sampleSuggestions[0].text);
    expect(onSuggestionSelect).toHaveBeenCalledTimes(1);
  });

  it('submits the exact selected prompt by keyboard', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(
      <SuggestionChips
        suggestions={sampleSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />,
    );

    await user.tab();
    await user.tab();
    expect(
      screen.getByRole('button', { name: sampleSuggestions[1].text }),
    ).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onSuggestionSelect).toHaveBeenCalledWith(sampleSuggestions[1].text);
    expect(onSuggestionSelect).toHaveBeenCalledTimes(1);
  });

  it('preserves DOM identity and focus by ID after editing and reordering, submitting the latest text', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    const { rerender } = render(
      <SuggestionChips
        suggestions={[
          { id: 'first', text: 'Same prompt' },
          { id: 'second', text: 'Same prompt' },
        ]}
        onSuggestionSelect={onSuggestionSelect}
      />,
    );
    const [first, second] = screen.getAllByRole('button');
    await user.tab();
    expect(first).toHaveFocus();

    rerender(
      <SuggestionChips
        suggestions={[
          { id: 'second', text: 'Same prompt' },
          { id: 'first', text: 'Edited prompt' },
        ]}
        onSuggestionSelect={onSuggestionSelect}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBe(second);
    expect(buttons[1]).toBe(first);
    expect(first).toHaveAccessibleName('Edited prompt');
    expect(first).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSuggestionSelect).toHaveBeenCalledExactlyOnceWith('Edited prompt');
  });

  it('does not activate disabled suggestions', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(
      <SuggestionChips
        suggestions={sampleSuggestions}
        disabled
        onSuggestionSelect={onSuggestionSelect}
      />,
    );

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onSuggestionSelect).not.toHaveBeenCalled();
  });
});
