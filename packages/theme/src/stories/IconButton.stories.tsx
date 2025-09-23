import { Meta, StoryObj } from "@storybook/react";
import { Bookmark, Edit, ShareIos, Trash } from "iconoir-react";
import { fn } from "storybook/test";

import { IconButton, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof IconButton> = {
  title: "Theme/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    active: { control: "boolean" },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <IconButton {...args} onClick={fn()}>
          <Edit />
        </IconButton>
      </ThemeProvider>
    );
  },
};
export default meta;

export const Basic: StoryObj = {};

export const Disabled: StoryObj = {
  args: {
    disabled: true,
  },
};

export const Active: StoryObj = {
  args: {
    active: true,
  },
};

export const Delete: StoryObj = {
  render: () => (
    <ThemeProvider>
      <IconButton onClick={fn()}>
        <Trash />
      </IconButton>
    </ThemeProvider>
  ),
};

export const InContext: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div
        style={{
          padding: "20px",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          backgroundColor: "var(--foreground-color)",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            COMPSCI 61A
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <IconButton onClick={fn()}>
              <Bookmark />
            </IconButton>
            <IconButton onClick={fn()}>
              <ShareIos />
            </IconButton>
            <IconButton onClick={fn()}>
              <Trash />
            </IconButton>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "var(--paragraph-color)",
          }}
        >
          The Structure and Interpretation of Computer Programs
        </p>
        <div
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "var(--paragraph-color)",
          }}
        >
          4 units • Fall 2024
        </div>
      </div>
    </ThemeProvider>
  ),
};
