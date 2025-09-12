/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#18181b' },
        light: { name: 'Light', value: '#f1f5f9' },
        dark_backdrop: { name: 'Dark Backdrop', value: '#09090b' },
        light_backdrop: { name: 'Light Backdrop', value: '#f8fafc' },
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    initialGlobals: {
      // 👇 Set the initial background color
      backgrounds: { value: 'dark' },
    },
  },
};

export default preview;
