import { Meta, StoryObj } from "@storybook/react";
import { Xmark } from "iconoir-react";
import { fn } from "storybook/test";

import { Badge, Color, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Badge> = {
  title: "Theme/Badge",
  component: Badge,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: Object.values(Color),
    },
    label: { control: "text" },
    icon: { control: false },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <Badge
          label={args.label}
          color={args.color}
          icon={args.icon}
          variant={args.variant}
        />
      </ThemeProvider>
    );
  },
};
export default meta;

export const Tag: StoryObj = {
  args: {
    label: "Very Easy",
    color: Color.Lime,
  },
};

export const Class: StoryObj = {
  args: {
    label: "COMPSCI 61A",
    color: Color.Blue,
    icon: <Xmark style={{ cursor: "pointer" }} onClick={fn()} />,
  },
};
