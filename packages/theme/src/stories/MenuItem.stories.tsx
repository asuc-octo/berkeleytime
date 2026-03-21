import { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { MenuItem, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof MenuItem> = {
  title: "Theme/MenuItem",
  component: MenuItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean" },
    disabled: { control: "boolean" },
    as: { control: "text" },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
          }}
        >
          <MenuItem onClick={fn()}>Menu Item 1</MenuItem>
          <MenuItem onClick={fn()}>Menu Item 2</MenuItem>
          <MenuItem onClick={fn()}>Menu Item 3</MenuItem>
        </div>
      </ThemeProvider>
    );
  },
};

export const Active: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
          }}
        >
          <MenuItem onClick={fn()}>Inactive Item</MenuItem>
          <MenuItem active onClick={fn()}>
            Active Item
          </MenuItem>
          <MenuItem onClick={fn()}>Another Inactive Item</MenuItem>
        </div>
      </ThemeProvider>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
          }}
        >
          <MenuItem onClick={fn()}>Enabled Item</MenuItem>
          <MenuItem disabled onClick={fn()}>
            Disabled Item
          </MenuItem>
          <MenuItem onClick={fn()}>Another Enabled Item</MenuItem>
        </div>
      </ThemeProvider>
    );
  },
};

export const AsLink: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
          }}
        >
          <MenuItem as="a" href="#">
            Link Item 1
          </MenuItem>
          <MenuItem as="a" href="#" active>
            Active Link Item
          </MenuItem>
          <MenuItem as="a" href="#">
            Link Item 2
          </MenuItem>
        </div>
      </ThemeProvider>
    );
  },
};

export const AsDiv: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
          }}
        >
          <MenuItem as="div">Div Item 1</MenuItem>
          <MenuItem as="div" active>
            Active Div Item
          </MenuItem>
          <MenuItem as="div">Div Item 2</MenuItem>
        </div>
      </ThemeProvider>
    );
  },
};
