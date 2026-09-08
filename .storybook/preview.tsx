import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    docs: { toc: true },
  },
  tags: ['autodocs'],
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story, { parameters }) => (
      <div
        className={`bg-bg-page font-sans text-text-primary antialiased ${parameters.layout === 'fullscreen' ? '' : 'min-h-screen p-4'}`}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
