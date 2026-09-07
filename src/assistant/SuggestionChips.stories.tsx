import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

const meta = {
  title: 'Assistant/Suggestions', component: SuggestionChips, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Stacked, wrapping prompt buttons. Selection submits the exact prompt immediately. The consumer must guard concurrent requests and clear its draft only after accepting a submission.' } } },
  args: { suggestions: sampleSuggestions, disabled: false, onSuggestionSelect: () => {} },
  render: function Example(args) {
    const [prompt, setPrompt] = useState('');
    return <div className="max-w-[380px]"><SuggestionChips {...args} onSuggestionSelect={setPrompt} /><p role="status" className="mt-3 text-sm">{prompt && `Submitted: ${prompt}`}</p></div>;
  },
} satisfies Meta<typeof SuggestionChips>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Prompts: Story = { parameters: { docs: { description: { story: 'Use in the empty state. Toggle disabled to inspect the concurrent-generation guard; edit suggestions to review wrapping.' } } } };
