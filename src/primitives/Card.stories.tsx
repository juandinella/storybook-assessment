import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Text } from './Text';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Surface for grouping content. No padding overrides required at the call site.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <Text>Sample neuropsych report — not a real case.</Text> },
};
