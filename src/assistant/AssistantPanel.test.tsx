import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { denseThread, sampleReport, sampleSuggestions } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import type { AssistantPanelProps } from './types';

describe('AssistantPanel', () => {
  it('follows output near the bottom but preserves the position when reading earlier turns', () => {
    const props: AssistantPanelProps = {
      messages: denseThread, status: 'idle', value: '', reportTitle: sampleReport.title,
      suggestions: sampleSuggestions, onValueChange: vi.fn(), onSubmit: vi.fn(),
      onStop: vi.fn(), onRetry: vi.fn(), onSuggestionSelect: vi.fn(), onCitationClick: vi.fn(),
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
    // jsdom records the assigned value; browsers clamp it to the scrollable range.
    expect(thread.scrollTop).toBe(height);

    thread.scrollTop = 100;
    fireEvent.scroll(thread);
    height = 1200;
    rerender(<AssistantPanel {...props} messages={[...messages]} />);
    expect(thread.scrollTop).toBe(100);

    thread.scrollTop = height - thread.clientHeight - 24;
    fireEvent.scroll(thread);
    height = 1400;
    rerender(<AssistantPanel {...props} messages={[...messages]} />);
    expect(thread.scrollTop).toBe(height);
  });
});
