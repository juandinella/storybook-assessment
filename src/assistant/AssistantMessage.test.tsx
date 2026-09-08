import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { errorMessage, sampleCitations, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';

describe('AssistantMessage', () => {
  it('exposes distinct, named user and assistant turns to assistive technology', () => {
    render(
      <>
        {sampleMessages.map((message) => (
          <AssistantMessage
            key={message.id}
            message={message}
            onRetry={vi.fn()}
            onCitationClick={vi.fn()}
          />
        ))}
      </>,
    );

    expect(
      within(screen.getByRole('article', { name: 'You' })).getByText(
        sampleMessages[0].content,
      ),
    ).toBeVisible();
    expect(
      within(screen.getByRole('article', { name: 'Assistant' })).getByText(
        sampleMessages[1].content,
      ),
    ).toBeVisible();
  });

  it('retries the failed message ID and disables retry during another response', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const props = { message: errorMessage, onRetry, onCitationClick: vi.fn() };
    const { rerender } = render(<AssistantMessage {...props} />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledExactlyOnceWith(errorMessage.id);
    rerender(<AssistantMessage {...props} retryDisabled />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('names each source by kind and title and returns the selected citation', async () => {
    const user = userEvent.setup();
    const onCitationClick = vi.fn();
    render(
      <AssistantMessage
        message={{ ...sampleMessages[1], citations: sampleCitations }}
        onRetry={vi.fn()}
        onCitationClick={onCitationClick}
      />,
    );

    const sources = within(screen.getByRole('list', { name: 'Sources' }));
    const sourceNames = [
      `Document: ${sampleCitations[0].title}`,
      sampleCitations[1].title,
      `Note: ${sampleCitations[2].title}`,
    ];
    for (const [index, citation] of sampleCitations.entries()) {
      await user.click(
        sources.getByRole('button', { name: sourceNames[index] }),
      );
      expect(onCitationClick).toHaveBeenNthCalledWith(index + 1, citation);
    }
    expect(onCitationClick).toHaveBeenCalledTimes(sampleCitations.length);
  });

  it('preserves an existing type prefix regardless of capitalization', () => {
    const citation = {
      ...sampleCitations[1],
      title: sampleCitations[1].title.toLowerCase(),
    };
    render(
      <AssistantMessage
        message={{ ...sampleMessages[1], citations: [citation] }}
        onRetry={vi.fn()}
        onCitationClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: citation.title }),
    ).toHaveTextContent(citation.title);
  });
});
