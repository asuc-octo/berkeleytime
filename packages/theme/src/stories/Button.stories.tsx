import { Meta, StoryObj } from "@storybook/react";
import { Plus, Trash } from "iconoir-react";
import { fn } from "storybook/test";

import { Button, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Button> = {
  title: "Theme/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
    disabled: { control: "boolean" },
    isDelete: { control: "boolean" },
    noFill: { control: "boolean" },
    active: { control: "boolean" },
    children: { control: "text" },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <Button onClick={fn()} {...args}>
          {args.children}
        </Button>
      </ThemeProvider>
    );
  },
};
export default meta;

export const Primary: StoryObj = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: StoryObj = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Tertiary: StoryObj = {
  args: {
    children: "Tertiary Button",
    variant: "tertiary",
  },
};

export const WithIcon: StoryObj = {
  args: {
    children: (
      <>
        <Plus />
        Add Item
      </>
    ),
    variant: "primary",
  },
};

export const DeleteButton: StoryObj = {
  args: {
    children: (
      <>
        <Trash />
        Delete
      </>
    ),
    variant: "primary",
    isDelete: true,
  },
};

export const DeleteTertiary: StoryObj = {
  args: {
    children: (
      <>
        <Trash />
        Delete
      </>
    ),
    variant: "tertiary",
    isDelete: true,
  },
};

export const NoFill: StoryObj = {
  args: {
    children: "No Fill Button",
    variant: "tertiary",
    noFill: true,
  },
};

export const Disabled: StoryObj = {
  args: {
    children: "Disabled Button",
    variant: "primary",
    disabled: true,
  },
};

export const DisabledSecondary: StoryObj = {
  args: {
    children: "Disabled Secondary",
    variant: "secondary",
    disabled: true,
  },
};

export const DisabledTertiary: StoryObj = {
  args: {
    children: "Disabled Tertiary",
    variant: "tertiary",
    disabled: true,
  },
};
