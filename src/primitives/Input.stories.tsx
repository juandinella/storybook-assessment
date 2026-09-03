import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Ask about this report…', 'aria-label': 'Prompt' },
  parameters: {
    docs: {
      description: {
        component:
          'Single-line field. Pass `error` to set `aria-invalid` and the danger border. Pair with a visible label in product UI.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = { args: { error: true, defaultValue: '' } };
export const Disabled: Story = { args: { disabled: true } };
