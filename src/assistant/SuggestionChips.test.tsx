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
      screen.getByRole('button', { name: sampleSuggestions[0] }),
    );
    expect(onSuggestionSelect).toHaveBeenCalledWith(sampleSuggestions[0]);
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
      screen.getByRole('button', { name: sampleSuggestions[1] }),
    ).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onSuggestionSelect).toHaveBeenCalledWith(sampleSuggestions[1]);
    expect(onSuggestionSelect).toHaveBeenCalledTimes(1);
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
