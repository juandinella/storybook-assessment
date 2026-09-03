import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Write a longer prompt…', 'aria-label': 'Prompt' },
  parameters: {
    docs: {
      description: {
        component: 'Multiline field. Same `error` contract as Input (`aria-invalid`).',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = { args: { error: true } };
