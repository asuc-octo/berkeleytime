import { Meta, StoryObj } from "@storybook/react";

import { Input, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Input> = {
  title: "Theme/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <Input {...args} />
      </ThemeProvider>
    );
  },
};
export default meta;

export const Basic: StoryObj = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

export const WithValue: StoryObj = {
  args: {
    type: "text",
    value: "Sample text",
    placeholder: "Enter text...",
  },
};

export const Disabled: StoryObj = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
  },
};
