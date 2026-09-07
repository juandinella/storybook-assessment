import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  it('submits the exact selected prompt by click and keyboard', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(<SuggestionChips suggestions={sampleSuggestions} onSuggestionSelect={onSuggestionSelect} />);

    await user.click(screen.getByRole('button', { name: sampleSuggestions[0] }));
    expect(onSuggestionSelect).toHaveBeenNthCalledWith(1, sampleSuggestions[0]);
    await user.tab();
    expect(screen.getByRole('button', { name: sampleSuggestions[1] })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onSuggestionSelect).toHaveBeenNthCalledWith(2, sampleSuggestions[1]);
    expect(onSuggestionSelect).toHaveBeenCalledTimes(2);
  });

  it('does not activate disabled suggestions', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(<SuggestionChips suggestions={sampleSuggestions} disabled onSuggestionSelect={onSuggestionSelect} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onSuggestionSelect).not.toHaveBeenCalled();
  });
});
