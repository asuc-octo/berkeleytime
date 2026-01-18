import { Meta, StoryObj } from "@storybook/react";

import { LoadingIndicator } from "@repo/theme";

const meta: Meta<typeof LoadingIndicator> = {
  title: "Theme/LoadingIndicator",
  component: LoadingIndicator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["md", "lg"],
    },
    loading: { control: "boolean" },
  },
};
export default meta;

export const Medium: StoryObj = {
  args: {
    size: "md",
  },
};

export const Large: StoryObj = {
  args: {
    size: "lg",
  },
};
