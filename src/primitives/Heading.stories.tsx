import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'Primitives/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: { children: 'Assistant' },
  parameters: {
    docs: {
      description: {
        component: 'Page and panel titles. `as` selects h1 / h2 / h3 and the matching type scale.',
      },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = { args: { as: 'h1' } };
export const H2: Story = { args: { as: 'h2' } };
export const H3: Story = { args: { as: 'h3', children: 'Sources' } };
