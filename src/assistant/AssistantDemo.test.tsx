import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  errorMessage,
  sampleCitations,
  sampleMessages,
  sampleSuggestions,
} from '@/fixtures';
import { AssistantDemo, type DemoScenario } from './AssistantDemo';

function renderDemo(scenario: DemoScenario) {
  const user = userEvent.setup();
  const onCitationClick = vi.fn();
  render(<AssistantDemo scenario={scenario} onCitationClick={onCitationClick} />);
  const panel = within(
    screen.getByRole('region', { name: 'Report assistant' }),
  );
  return {
    user,
    onCitationClick,
    input: panel.getByRole('textbox', { name: 'Message to assistant' }),
    thread: within(panel.getByRole('region', { name: 'Conversation' })),
    announcement: panel.getByRole('status'),
  };
}

beforeEach(() =>
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] }),
);
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('AssistantDemo', () => {
  it('forwards source selections without extra feedback, focus changes, or draft changes', async () => {
    const { user, input, onCitationClick } = renderDemo('citations');
    await user.type(input, sampleSuggestions[0]);

    for (const citation of sampleCitations) {
      const source = screen.getByRole('button', {
        name: (name) => name.endsWith(citation.title),
      });
      source.focus();
      await user.keyboard('{Enter}');

      expect(onCitationClick).toHaveBeenLastCalledWith(citation);
      expect(
        screen.queryByRole('status', { name: 'Source selection' }),
      ).not.toBeInTheDocument();
      expect(source).toHaveFocus();
      expect(input).toHaveValue(sampleSuggestions[0]);
    }
    expect(onCitationClick).toHaveBeenCalledTimes(sampleCitations.length);
  });

  it('sends and clears the draft, allows editing during streaming, and retains the next draft on completion', async () => {
    const { user, input, thread, announcement } = renderDemo('empty');
    await user.type(input, sampleSuggestions[0]);
    await user.keyboard('{Enter}');

    expect(thread.getAllByRole('article')).toHaveLength(2);
    expect(
      within(thread.getByRole('article', { name: 'You' })).getByText(
        sampleSuggestions[0],
        { exact: true },
      ),
    ).toBeVisible();
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    const answer = thread.getByRole('article', { name: 'Assistant' });
    expect(
      within(answer).getByText('Preparing', { exact: true }),
    ).toBeVisible();
    expect(announcement).toHaveTextContent('Preparing response.');

    await user.type(input, sampleSuggestions[1]);
    await user.keyboard('{Enter}');
    expect(thread.getAllByRole('article')).toHaveLength(2);
    expect(input).toHaveValue(sampleSuggestions[1]);
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(thread.getByRole('article', { name: 'Assistant' })).toBe(answer);
    expect(
      within(answer).getByText(sampleMessages[1].content, { exact: true }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Stop response' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeVisible();
    expect(input).toHaveValue(sampleSuggestions[1]);
    expect(input).toHaveFocus();
    expect(announcement).toHaveTextContent('Response complete.');
  });

  it.each([0, 12])(
    'Stop after %i characters freezes the answer without submitting or clearing the next draft',
    async (characters) => {
      const { user, input, thread, announcement } = renderDemo('streaming');
      const answer = thread.getByRole('article', { name: 'Assistant' });
      const id = answer.getAttribute('data-message-id');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(55 * characters);
      });
      const partial = sampleMessages[1].content.slice(0, characters);
      if (characters)
        expect(
          within(answer).getByText(partial, { exact: true }),
        ).toBeVisible();
      else
        expect(
          within(answer).getByText('Preparing', { exact: true }),
        ).toBeVisible();
      await user.type(input, sampleSuggestions[2]);

      await user.click(screen.getByRole('button', { name: 'Stop response' }));

      expect(input).toHaveFocus();
      expect(input).toHaveValue(sampleSuggestions[2]);
      expect(
        screen.getByRole('button', { name: 'Send message' }),
      ).toBeVisible();
      expect(thread.getAllByRole('article')).toHaveLength(2);
      expect(answer).toHaveAttribute('data-message-id', id);
      expect(
        within(answer).queryByText('Preparing', { exact: true }),
      ).not.toBeInTheDocument();
      expect(
        within(answer).getByText(
          characters
            ? 'Response stopped. This answer is incomplete.'
            : 'Response stopped. No answer was generated.',
        ),
      ).toBeVisible();
      expect(announcement).toHaveTextContent(
        characters
          ? 'Response stopped. Partial answer preserved.'
          : 'Response stopped. No answer was generated.',
      );
      const stoppedContent = answer.textContent;

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(answer.textContent).toBe(stoppedContent);
      if (characters)
        expect(
          within(answer).getByText(partial, { exact: true }),
        ).toBeVisible();
      expect(thread.getAllByRole('article')).toHaveLength(2);
      expect(input).toHaveValue(sampleSuggestions[2]);
      expect(
        screen.queryByRole('button', { name: 'Retry' }),
      ).not.toBeInTheDocument();
    },
  );

  it('retries the same failed ID in place without duplicating turns or changing the draft', async () => {
    const { user, input, thread, announcement } = renderDemo('error');
    const answer = thread.getByRole('article', { name: 'Assistant' });
    expect(answer).toHaveAttribute('data-message-id', errorMessage.id);
    expect(announcement).toHaveTextContent(
      'Response failed. Retry is available.',
    );
    await user.type(input, sampleSuggestions[2]);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await user.click(within(answer).getByRole('button', { name: 'Retry' }));

    expect(input).toHaveFocus();
    expect(input).toHaveValue(sampleSuggestions[2]);
    expect(thread.getAllByRole('article')).toHaveLength(2);
    expect(thread.getByRole('article', { name: 'Assistant' })).toBe(answer);
    expect(answer).toHaveAttribute('data-message-id', errorMessage.id);
    expect(
      within(answer).getByText('Preparing', { exact: true }),
    ).toBeVisible();
    expect(
      within(answer).queryByText(errorMessage.content),
    ).not.toBeInTheDocument();
    expect(
      within(answer).queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(thread.getAllByRole('article')).toHaveLength(2);
    expect(thread.getByRole('article', { name: 'Assistant' })).toBe(answer);
    expect(
      within(answer).getByText(sampleMessages[1].content, { exact: true }),
    ).toBeVisible();
    expect(input).toHaveValue(sampleSuggestions[2]);
    expect(announcement).toHaveTextContent('Response complete.');
  });

  it('retries an older failed turn after a later answer, announcing its transitions without rereading streamed characters', async () => {
    const { user, input, thread, announcement } = renderDemo('error');
    const olderAnswer = thread.getByRole('article', { name: 'Assistant' });
    await user.type(input, sampleSuggestions[0]);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    const retry = within(olderAnswer).getByRole('button', { name: 'Retry' });
    expect(retry).toBeDisabled();
    await user.click(retry);
    expect(olderAnswer).toHaveTextContent(errorMessage.content);
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    const turns = thread.getAllByRole('article');
    expect(turns).toHaveLength(4);
    const ids = turns.map((turn) => turn.getAttribute('data-message-id'));
    const laterAnswer = thread.getAllByRole('article', {
      name: 'Assistant',
    })[1];
    const laterContent = laterAnswer.textContent;
    await user.type(input, sampleSuggestions[2]);
    expect(announcement).toHaveTextContent('Response complete.');

    await user.click(retry);

    expect(input).toHaveFocus();
    expect(olderAnswer).toHaveAttribute('data-message-id', errorMessage.id);
    expect(
      within(olderAnswer).getByText('Preparing', { exact: true }),
    ).toBeVisible();
    expect(announcement).toHaveTextContent('Preparing response.');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(55 * 12);
    });
    expect(
      within(olderAnswer).getByText(sampleMessages[1].content.slice(0, 12), {
        exact: true,
      }),
    ).toBeVisible();
    expect(announcement).toHaveTextContent('Preparing response.');
    expect(laterAnswer.textContent).toBe(laterContent);
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(announcement).toHaveTextContent('Response complete.');
    expect(
      thread
        .getAllByRole('article')
        .map((turn) => turn.getAttribute('data-message-id')),
    ).toEqual(ids);
    expect(
      within(olderAnswer).getByText(sampleMessages[1].content, { exact: true }),
    ).toBeVisible();
    expect(laterAnswer.textContent).toBe(laterContent);
    expect(input).toHaveValue(sampleSuggestions[2]);
    expect(input).toHaveFocus();
  });

  it('immediately submits the exact suggestion, clears an existing draft, and restores composer focus', async () => {
    const { user, input, thread } = renderDemo('empty');
    await user.type(input, sampleSuggestions[2]);

    await user.click(
      screen.getByRole('button', { name: sampleSuggestions[0] }),
    );

    expect(thread.getAllByRole('article')).toHaveLength(2);
    expect(
      within(thread.getByRole('article', { name: 'You' })).getByText(
        sampleSuggestions[0],
        { exact: true },
      ),
    ).toBeVisible();
    expect(
      thread.queryByText(sampleSuggestions[2], { exact: true }),
    ).not.toBeInTheDocument();
    expect(
      within(thread.getByRole('article', { name: 'Assistant' })).getByText(
        'Preparing',
        { exact: true },
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stop response' })).toBeVisible();
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });
});
