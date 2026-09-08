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
      description: {
        component:
          'A controlled report-side assistant. The example host owns messages, draft, retries and the supplied fake stream. Sources report their selection; this assessment does not include a document viewer. Use the theme toolbar to inspect both themes.',
      },
      story: { inline: false, height: 800 },
    },
  },
  argTypes: {
    scenario: { control: false, table: { disable: true } },
    density: {
      control: 'inline-radio',
      options: ['comfortable', 'compact'],
      description:
        'Comfortable uses 28px between turns; compact uses 16px and tightens the welcome, suggestions, and sources. Text, button targets, header, and composer keep their size.',
    },
    reportTitle: {
      control: 'text',
      description: 'Report context displayed in the fixed header.',
    },
    greetingName: {
      control: 'text',
      description: 'First name used only in the empty-state welcome.',
    },
    autoScrollOnSubmit: {
      control: 'boolean',
      description:
        'When enabled, a new user turn smoothly returns to the bottom and resumes following output. Defaults to false; respects reduced motion and can be interrupted by scrolling.',
    },
  },
  args: {
    scenario: 'empty',
    density: 'comfortable',
    reportTitle: sampleReport.title,
    greetingName: clinician.firstName,
    autoScrollOnSubmit: false,
  },
  render: (args) => <AssistantDemo key={args.scenario} {...args} />,
} satisfies Meta<typeof AssistantDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use before the first question. Activate a suggestion to send its exact prompt, or write a draft and press Enter. Change greetingName or reportTitle to inspect wrapping.',
      },
    },
  },
};
export const Streaming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use while an answer arrives. Edit the next draft without submitting concurrently; Stop preserves the partial answer and draft. Remount the story to replay. Change density to compare spacing.',
      },
    },
  },
  args: { scenario: 'streaming' },
};
export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use when an assistant turn fails. Retry replaces that turn in place without repeating the question or clearing the draft. The composer remains usable. Change reportTitle to inspect long context.',
      },
    },
  },
  args: { scenario: 'error' },
};
export const WithCitations: Story = {
  name: 'WithCitations',
  parameters: {
    docs: {
      description: {
        story:
          'Use for a sourced answer. Document, section, and note buttons identify the selected source in a reserved two-line area below the panel, without navigation or moving the composer. Longer confirmations can be scrolled with keyboard focus. Change density to inspect the source list in context.',
      },
    },
  },
  args: { scenario: 'citations' },
};
export const DenseThread: Story = {
  name: 'DenseThread',
  parameters: {
    docs: {
      description: {
        story:
          'Use to review ten turns in a bounded sidebar. Scroll upward to reveal the down-arrow button above the composer. Activate Scroll to latest response to return to the bottom and resume following output. Enable autoScrollOnSubmit, scroll up, and send a message to try the optional smooth return. By default, incoming text preserves your reading position. Header and composer stay fixed. Change density to compare spacing.',
      },
    },
  },
  args: { scenario: 'dense' },
};
