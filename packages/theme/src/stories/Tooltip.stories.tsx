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
      <Tooltip
        trigger={<Button variant="secondary">Hover me</Button>}
        title="This is a basic tooltip"
      />
    </ThemeProvider>
  ),
};

export const WithDescription: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip
        trigger={<Button variant="primary">Save</Button>}
        title="Save Changes"
        description="Save your current work to the server"
      />
    </ThemeProvider>
  ),
};

export const IconTooltip: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip
        trigger={
          <IconButton variant="outline">
            <Trash />
          </IconButton>
        }
        title="Delete item"
      />
    </ThemeProvider>
  ),
};

export const WithArrow: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip
        trigger={<Button variant="secondary">Hover for arrow</Button>}
        title="Tooltip with arrow"
        hasArrow={true}
      />
    </ThemeProvider>
  ),
};

export const CustomContent: StoryObj = {
  render: () => (
    <ThemeProvider>
      <Tooltip
        trigger={<Button variant="secondary">Custom content</Button>}
        content={
          <div style={{ padding: "8px" }}>
            <strong style={{ color: "var(--blue-500)" }}>Custom</strong>{" "}
            formatted content
          </div>
        }
      />
    </ThemeProvider>
  ),
};

export const DifferentSides: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Tooltip
          trigger={<Button variant="secondary">Top</Button>}
          title="Tooltip on top"
          side="top"
        />
        <Tooltip
          trigger={<Button variant="secondary">Right</Button>}
          title="Tooltip on right"
          side="right"
        />
        <Tooltip
          trigger={<Button variant="secondary">Bottom</Button>}
          title="Tooltip on bottom"
          side="bottom"
        />
        <Tooltip
          trigger={<Button variant="secondary">Left</Button>}
          title="Tooltip on left"
          side="left"
        />
      </div>
    </ThemeProvider>
  ),
};
