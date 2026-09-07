import type { Meta, StoryObj } from '@storybook/react-vite';
import { clinician, sampleReport } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import { AssistantDemo } from './AssistantDemo';

const meta = {
  title: 'Assistant/Panel',
  component: AssistantDemo,
  subcomponents: { AssistantPanel },
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: 'A controlled report-side assistant. The example host owns messages, draft, retries and the supplied fake stream. Sources report their selection; this assessment does not include a document viewer. Use the theme toolbar to inspect both themes.' },
      story: { inline: false, height: 800 },
    },
  },
  argTypes: {
    scenario: { control: false, table: { disable: true } },
    density: { control: 'inline-radio', options: ['comfortable', 'compact'], description: 'Changes spacing, not text size or action targets.' },
    reportTitle: { control: 'text', description: 'Report context displayed in the fixed header.' },
    greetingName: { control: 'text', description: 'First name used only in the empty-state welcome.' },
  },
  args: { scenario: 'empty', density: 'comfortable', reportTitle: sampleReport.title, greetingName: clinician.firstName },
  render: (args) => <AssistantDemo key={args.scenario} {...args} />,
} satisfies Meta<typeof AssistantDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  parameters: { docs: { description: { story: 'Use before the first question. Activate a suggestion to send its exact prompt, or write a draft and press Enter. Change greetingName or reportTitle to inspect wrapping.' } } },
};
export const Streaming: Story = {
  parameters: { docs: { description: { story: 'Use while an answer arrives. Edit the next draft without submitting concurrently; Stop preserves the partial answer and draft. Remount the story to replay. Change density to compare spacing.' } } },
  args: { scenario: 'streaming' },
};
export const Error: Story = {
  parameters: { docs: { description: { story: 'Use when an assistant turn fails. Retry replaces that turn in place without repeating the question or clearing the draft. The composer remains usable. Change reportTitle to inspect long context.' } } },
  args: { scenario: 'error' },
};
export const WithCitations: Story = {
  name: 'WithCitations',
  parameters: { docs: { description: { story: 'Use for a sourced answer. Document, section, and note buttons identify the selected source below the panel, without navigation. Change density to inspect the source list in context.' } } },
  args: { scenario: 'citations' },
};
export const DenseThread: Story = {
  name: 'DenseThread',
  parameters: { docs: { description: { story: 'Use to review ten turns in a bounded sidebar. Scroll upward, then send a question: incoming text must not pull you away from earlier content. Header and composer stay fixed. Change density to compare spacing.' } } },
  args: { scenario: 'dense' },
};
