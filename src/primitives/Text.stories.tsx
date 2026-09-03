import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  tags: ['autodocs'],
  args: { children: 'The assistant can rewrite a section or cite a source.' },
  parameters: {
    docs: {
      description: {
        component: 'Body copy. `tone` maps to primary / secondary / tertiary text tokens.',
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { tone: 'primary' } };
export const Secondary: Story = { args: { tone: 'secondary' } };
export const Tertiary: Story = { args: { tone: 'tertiary' } };
