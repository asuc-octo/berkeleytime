import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { List, Table, ViewGrid } from "iconoir-react";

import { PillSwitcher, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof PillSwitcher> = {
  title: "Theme/PillSwitcher",
  component: PillSwitcher,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    fullWidth: { control: "boolean" },
    iconOnly: { control: "boolean" },
  },
};
export default meta;

const basicItems = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export const Basic: StoryObj = {
  render: () => {
    const [value, setValue] = useState("option1");

    return (
      <ThemeProvider>
        <PillSwitcher
          items={basicItems}
          value={value}
          onValueChange={setValue}
        />
      </ThemeProvider>
    );
  },
};

export const WithDefaultValue: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <PillSwitcher items={basicItems} defaultValue="option2" />
      </ThemeProvider>
    );
  },
};

export const FullWidth: StoryObj = {
  render: () => {
    const [value, setValue] = useState("option1");

    return (
      <ThemeProvider>
        <div style={{ width: "400px" }}>
          <PillSwitcher
            items={basicItems}
            value={value}
            onValueChange={setValue}
            fullWidth
          />
        </div>
      </ThemeProvider>
    );
  },
};

export const WithIcons: StoryObj = {
  render: () => {
    const [value, setValue] = useState("grid");

    const iconItems = [
      {
        value: "grid",
        label: (
          <>
            <ViewGrid /> Grid
          </>
        ),
      },
      {
        value: "list",
        label: (
          <>
            <List /> List
          </>
        ),
      },
      {
        value: "table",
        label: (
          <>
            <Table /> Table
          </>
        ),
      },
    ];

    return (
      <ThemeProvider>
        <PillSwitcher
          items={iconItems}
          value={value}
          onValueChange={setValue}
        />
      </ThemeProvider>
    );
  },
};

export const IconOnly: StoryObj = {
  render: () => {
    const [value, setValue] = useState("grid");

    const iconOnlyItems = [
      { value: "grid", label: <ViewGrid /> },
      { value: "list", label: <List /> },
      { value: "table", label: <Table /> },
    ];

    return (
      <ThemeProvider>
        <PillSwitcher
          items={iconOnlyItems}
          value={value}
          onValueChange={setValue}
          iconOnly
        />
      </ThemeProvider>
    );
  },
};

export const ManyOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState("option1");

    const manyItems = Array.from({ length: 8 }, (_, i) => ({
      value: `option${i + 1}`,
      label: `Option ${i + 1}`,
    }));

    return (
      <ThemeProvider>
        <PillSwitcher
          items={manyItems}
          value={value}
          onValueChange={setValue}
        />
      </ThemeProvider>
    );
  },
};
