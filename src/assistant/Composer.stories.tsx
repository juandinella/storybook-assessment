import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { Composer } from './Composer';
import type { ComposerProps } from './types';

const meta = {
  title: 'Assistant/Composer', component: Composer, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Controlled multiline draft. Enter sends, Shift+Enter inserts a newline, and IME confirmation never sends. Streaming keeps editing available and swaps Send for Stop. The unavailable Send uses aria-disabled so completion cannot discard keyboard focus.' } } },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'streaming', 'error'] },
    value: { control: 'text' },
  },
  args: { status: 'idle', value: '', onValueChange: () => {}, onSubmit: () => {}, onStop: () => {} },
  render: function Example() {
    const [args, updateArgs] = useArgs<ComposerProps>();
    const [feedback, setFeedback] = useState('');
    return <div className="max-w-[388px]">
      <Composer {...args} onValueChange={(value) => updateArgs({ value })}
        onSubmit={() => { setFeedback(`Submitted: ${args.value}`); updateArgs({ value: '' }); }}
        onStop={() => { setFeedback('Response stopped. Draft preserved.'); updateArgs({ status: 'idle' }); }} />
      <p role="status" className="mt-3 text-sm">{feedback}</p>
    </div>;
  },
} satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Draft: Story = { parameters: { docs: { description: { story: 'Use for composing a question. Change status to review Send, Stop, and error recovery without marking the field invalid.' } } } };
export const DuringGeneration: Story = { args: { status: 'streaming', value: 'A draft for the next question' } };
