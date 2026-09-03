import type { Meta, StoryObj } from '@storybook/react-vite';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { 'aria-label': 'Close', children: <X size={16} /> },
  parameters: {
    docs: {
      description: {
        component:
          'Icon-only control. `aria-label` is required — do not rely on the icon to name the action.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
