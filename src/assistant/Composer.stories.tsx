import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs, useState } from 'storybook/preview-api';
import { Composer } from './Composer';

const meta = {
  title: 'Assistant/Composer',
  component: Composer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Controlled multiline draft. Enter sends, Shift+Enter inserts a newline, and IME confirmation never sends. Streaming keeps editing available and swaps Send for Stop. The unavailable Send uses aria-disabled so completion cannot discard keyboard focus. Source examples show the component API; the consuming application supplies the state setter and submission/cancellation handlers.',
      },
      source: {
        language: 'tsx',
        type: 'dynamic',
        transform: (
          _source: string,
          { args }: { args: ComponentProps<typeof Composer> },
        ) => `<Composer
  value={${JSON.stringify(args.value)}}
  status="${args.status}"
  onValueChange={setValue}
  onSubmit={handleSubmit}
  onStop={handleStop}
/>`,
      },
    },
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['idle', 'streaming', 'error'],
    },
    value: { control: 'text' },
  },
  args: {
    status: 'idle',
    value: '',
    onValueChange: () => {},
    onSubmit: () => {},
    onStop: () => {},
  },
  // The parameter keeps Storybook's dynamic source rendering enabled.
  render: function Example(_args) {
    const [args, updateArgs] = useArgs<ComponentProps<typeof Composer>>();
    const [feedback, setFeedback] = useState('');
    return (
      <div className="max-w-97">
        <Composer
          {...args}
          onValueChange={(value) => updateArgs({ value })}
          onSubmit={() => {
            setFeedback(`Submitted: ${args.value}`);
            updateArgs({ value: '' });
          }}
          onStop={() => {
            setFeedback('Response stopped. Draft preserved.');
            updateArgs({ status: 'idle' });
          }}
        />
        <p role="status" className="mt-3 text-sm">
          {feedback}
        </p>
      </div>
    );
  },
} satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Draft: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use for composing a question. Change status to review Send, Stop, and error recovery without marking the field invalid.',
      },
    },
  },
};
export const Streaming: Story = {
  args: { status: 'streaming', value: 'A draft for the next question' },
  parameters: {
    docs: {
      description: {
        story:
          'Use while a response is being generated. The draft remains editable and Stop requests cancellation. Change status to compare the stable Send/Stop action and its keyboard focus ring.',
      },
    },
  },
};
