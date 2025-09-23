import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Option, Select, ThemeProvider } from "@repo/theme";

const courseOptions = [
  { value: "cs61a", label: "COMPSCI 61A" },
  { value: "cs61b", label: "COMPSCI 61B" },
  { value: "cs61c", label: "COMPSCI 61C" },
  { value: "math1a", label: "MATH 1A" },
  { value: "math1b", label: "MATH 1B" },
  { value: "physics7a", label: "PHYSICS 7A" },
  { value: "physics7b", label: "PHYSICS 7B" },
  { value: "chem1a", label: "CHEM 1A" },
] as Option<string>[];

const courseOptionsWithMeta = courseOptions.map((c) => {
  return {
    meta: Math.round(Math.random() * 100),
    ...c,
  };
}) as Option<string>[];

const meta: Meta<typeof Select> = {
  title: "Theme/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    multi: { control: "boolean" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "foreground"],
    },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const WithMeta: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptionsWithMeta}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const WithSelection: StoryObj = {
  render: () => {
    const [value, setValue] = useState("cs61a");

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const MultiSelect: StoryObj = {
  render: () => {
    const [value, setValue] = useState(["cs61a", "math1a"]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && Array.isArray(n)) setValue(n);
            }}
            multi
            placeholder="Select courses"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const Clearable: StoryObj = {
  render: () => {
    const [value, setValue] = useState("cs61a");

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            clearable
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => {
    const [value, setValue] = useState("cs61a");

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            disabled
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const ForegroundVariant: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <ThemeProvider>
        <div
          style={{
            width: "300px",
            padding: "20px",
            backgroundColor: "var(--background-color)",
            borderRadius: "8px",
          }}
        >
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            variant="foreground"
            placeholder="Select a course"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const LongList: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");

    const longOptions = Array.from({ length: 50 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
      meta: `Description for option ${i + 1}`,
    }));

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={longOptions}
            value={value}
            onChange={(n) => {
              if (n && !Array.isArray(n)) setValue(n);
            }}
            placeholder="Select from many options"
            clearable
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};

export const MultiSelectWithClear: StoryObj = {
  render: () => {
    const [value, setValue] = useState(["cs61a", "math1a", "physics7a"]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Select
            options={courseOptions}
            value={value}
            onChange={(n) => {
              if (Array.isArray(n)) setValue(n);
            }}
            multi
            clearable
            placeholder="Select multiple courses"
          />
        </div>
        <div style={{ width: "300px", height: "200px" }}></div>
      </ThemeProvider>
    );
  },
};
