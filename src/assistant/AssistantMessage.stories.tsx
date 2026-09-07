import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { errorMessage, sampleCitations, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';

const meta = {
  title: 'Assistant/Message', component: AssistantMessage, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'A named user or assistant article. Responses are plain text, not Markdown. Sources remain visible; failure and interruption are separate states. The panel provides transition announcements and restores focus before Retry removes its control.' } } },
  args: { message: { ...sampleMessages[1], citations: sampleCitations }, density: 'comfortable', retryDisabled: false, onRetry: () => {}, onCitationClick: () => {} },
  argTypes: { density: { control: 'inline-radio', options: ['comfortable', 'compact'] } },
  render: function Example(args) {
    const [feedback, setFeedback] = useState('');
    return <div className="flex max-w-[380px] flex-col">
      <AssistantMessage {...args} onRetry={(id) => setFeedback(`Retry requested: ${id}`)} onCitationClick={(citation) => setFeedback(`Selected ${citation.kind}: ${citation.title}`)} />
      <p role="status" className="mt-3 text-sm">{feedback}</p>
    </div>;
  },
} satisfies Meta<typeof AssistantMessage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithSources: Story = {};
export const User: Story = { args: { message: sampleMessages[0] } };
export const Failed: Story = { args: { message: errorMessage } };
export const Preparing: Story = { args: { message: { id: 'preparing', role: 'assistant', content: '', status: 'streaming' } } };
export const Interrupted: Story = { args: { message: { ...sampleMessages[1], citations: undefined, interrupted: true } } };
