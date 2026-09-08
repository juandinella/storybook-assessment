import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { clinician, sampleReport } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import { AssistantDemo } from './AssistantDemo';
import type { AssistantPanelProps } from './types';

const meta = {
  title: 'Assistant/Panel',
  component: AssistantPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    demoScenario: 'empty',
    docs: {
      description: {
        component:
          'AssistantPanel combines a report header, scrollable conversation, suggestions, and composer in a controlled sidebar. The examples manage conversation state and simulated streaming to demonstrate the interactions.',
      },
      // Inline rendering keeps the docs controls connected to the example.
      story: { inline: true, height: '800px' },
      source: {
        language: 'tsx',
        type: 'dynamic',
        transform: (
          _source: string,
          { args }: { args: AssistantPanelProps },
        ) => `import { AssistantPanel } from '@/assistant';
import { sampleSuggestions } from '@/fixtures';

// Render inside a bounded-height container.
// The consumer supplies messages, status, value, and the callbacks below.
<AssistantPanel
  messages={messages}
  status={status}
  value={value}
  onValueChange={setValue}
  onSubmit={() => submitPrompt(value)}
  onStop={stopResponse}
  onRetry={retryResponse}
  onSuggestionSelect={submitPrompt}
  onCitationClick={handleCitationClick}
  suggestions={sampleSuggestions}
  reportTitle={${JSON.stringify(args.reportTitle)}}
  greetingName={${JSON.stringify(args.greetingName)}}
  density={${JSON.stringify(args.density)}}
  autoScrollOnSubmit={${args.autoScrollOnSubmit}}
  className="max-h-190 flex-1 rounded-md shadow-sm"
/>`,
      },
    },
  },
  argTypes: {
    messages: { control: false, table: { type: { summary: 'readonly Message[]' } } },
    status: { control: false },
    value: { control: false },
    suggestions: { control: false, table: { type: { summary: 'readonly string[]' } } },
    className: { control: false },
    onValueChange: { control: false },
    onSubmit: { control: false },
    onStop: { control: false },
    onRetry: { control: false },
    onSuggestionSelect: { control: false },
    onCitationClick: { control: false },
    density: {
      control: 'inline-radio',
      options: ['comfortable', 'compact'],
      description:
        'Comfortable uses 28px between turns; compact uses 16px and tightens the welcome, suggestions, and sources. Text, button targets, header, and composer keep their size.',
    },
    reportTitle: {
      control: 'text',
      description: 'Report context displayed beneath the panel heading.',
    },
    greetingName: {
      control: 'text',
      description: 'First name used only in the empty-state welcome.',
    },
    autoScrollOnSubmit: {
      control: 'boolean',
      description:
        'Defaults to false. When messages gains a new user-message ID in an existing conversation, resumes following if the reader is no longer following output. Triggered by messages updates, not by onSubmit. Scrolls smoothly unless reduced motion is preferred; pointer, wheel, touch, or scroll-key input in the conversation cancels the animation.',
    },
  },
  args: {
    density: 'comfortable',
    reportTitle: sampleReport.title,
    greetingName: clinician.firstName,
    autoScrollOnSubmit: false,
    onCitationClick: action('onCitationClick'),
  },
  render: (args, { parameters, viewMode }) => (
    // The inline docs canvas replaces the demo's standalone viewport height.
    <div className={viewMode === 'docs' ? '[&>div]:h-200' : undefined}>
      <AssistantDemo key={parameters.demoScenario} {...args} scenario={parameters.demoScenario} />
    </div>
  ),
} satisfies Meta<typeof AssistantPanel>;
export default meta;
type Story = StoryObj<typeof AssistantPanel>;

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
  argTypes: { greetingName: { control: false } },
  parameters: {
    demoScenario: 'streaming',
    docs: {
      description: {
        story:
          'Use while an answer arrives. Edit the next draft without submitting concurrently; Stop preserves the partial answer and draft. Remount the story to replay. Change density to compare spacing.',
      },
    },
  },
};
export const Error: Story = {
  argTypes: { greetingName: { control: false } },
  parameters: {
    demoScenario: 'error',
    docs: {
      description: {
        story:
          'Use when an assistant turn fails. Retry replaces that turn in place without repeating the question or clearing the draft. The composer remains usable. Change reportTitle to inspect long context.',
      },
    },
  },
};
export const WithCitations: Story = {
  name: 'WithCitations',
  argTypes: { greetingName: { control: false } },
  parameters: {
    demoScenario: 'citations',
    docs: {
      description: {
        story:
          'Use for a sourced answer. Click a document, section, or note to inspect its citation object in Storybook Actions; the example does not open a source viewer. Change density to inspect the source list in context.',
      },
    },
  },
};
export const DenseThread: Story = {
  name: 'DenseThread',
  argTypes: { greetingName: { control: false } },
  parameters: {
    demoScenario: 'dense',
    docs: {
      description: {
        story:
          'Use to review ten turns in a bounded sidebar. Scroll upward to reveal the down-arrow button above the composer. Activate Scroll to latest response to return to the bottom and resume following output. Enable autoScrollOnSubmit, scroll up, and send a message to try the optional smooth return. By default, incoming text preserves your reading position. Header and composer stay fixed. Change density to compare spacing.',
      },
    },
  },
};

export const AutoScrollOnSubmit: Story = {
  ...DenseThread,
  name: 'AutoScrollOnSubmit',
  args: { autoScrollOnSubmit: true },
  parameters: {
    ...DenseThread.parameters,
    docs: {
      description: {
        story:
          'Use when sending a new question should return to the latest turn. Scroll up in the conversation, then type a message and press Enter: the thread smoothly returns to the bottom and follows the response. Turn off autoScrollOnSubmit to compare with preserving your reading position. Reduced motion makes the return immediate.',
      },
    },
  },
};
