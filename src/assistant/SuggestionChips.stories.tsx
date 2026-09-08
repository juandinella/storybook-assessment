import type { Meta, StoryObj } from '@storybook/react-vite';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

const meta = {
  title: 'Assistant/SuggestionChips',
  component: SuggestionChips,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stacked, wrapping prompt buttons. Activation reports the exact prompt through onSuggestionSelect. These isolated stories show the component without submission feedback; the Panel stories demonstrate immediate submission and draft clearing.',
      },
    },
  },
  args: {
    suggestions: sampleSuggestions,
    disabled: false,
    density: 'comfortable',
    onSuggestionSelect: () => {},
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
  },
} satisfies Meta<typeof SuggestionChips>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use before the first turn to offer suggested prompts. Edit suggestions to review text wrapping.',
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story:
          'Use when suggestions must remain visible but unavailable, such as while another response is being generated.',
      },
    },
  },
};
