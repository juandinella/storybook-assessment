import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Send' },
  parameters: {
    docs: {
      description: {
        component:
          'Primary actions. Use `primary` for the main CTA, `secondary` for a quieter pair, `ghost` for inline actions. Always set `type` explicitly in forms (`submit` vs `button`).',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Disabled: Story = { args: { disabled: true } };
export const Submit: Story = { args: { type: 'submit', children: 'Save' } };
