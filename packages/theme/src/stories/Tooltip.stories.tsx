import { Meta, StoryObj } from "@storybook/react";
import { Trash } from "iconoir-react";

import { Button, IconButton, ThemeProvider, Tooltip } from "@repo/theme";

const meta: Meta<typeof Tooltip> = {
  title: "Theme/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    sideOffset: { control: "number" },
    hasArrow: { control: "boolean" },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip content="This is a basic tooltip">
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
    </ThemeProvider>
  ),
};

export const WithDescription: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip
        content="Save Changes"
        description="Save your current work to the server"
      >
        <Button variant="primary">Save</Button>
      </Tooltip>
    </ThemeProvider>
  ),
};

export const IconTooltip: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip content="Delete item">
        <IconButton variant="outline">
          <Trash />
        </IconButton>
      </Tooltip>
    </ThemeProvider>
  ),
};
