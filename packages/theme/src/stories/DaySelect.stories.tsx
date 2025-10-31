import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { DaySelect, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof DaySelect> = {
  title: "Theme/DaySelect",
  component: DaySelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "lg"],
      description: "Size of the day select buttons",
    },
  },
  render: (args: any) => {
    const [days, setDays] = useState([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);

    return (
      <ThemeProvider>
        <DaySelect days={days} updateDays={setDays} size={args.size} />
      </ThemeProvider>
    );
  },
};
export default meta;

export const Large: StoryObj = {
  args: {
    size: "lg",
  },
};

export const Small: StoryObj = {
  args: {
    size: "sm",
  },
};

export const InContext: StoryObj = {
  render: () => {
    const [days, setDays] = useState([
      true,
      true,
      false,
      true,
      false,
      false,
      false,
    ]);

    return (
      <ThemeProvider>
        <div
          style={{
            padding: "20px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            backgroundColor: "var(--foreground-color)",
            maxWidth: "300px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--heading-color)",
            }}
          >
            Class Schedule
          </h3>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--paragraph-color)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Select Days:
            </label>
            <DaySelect days={days} updateDays={setDays} size="lg" />
          </div>
        </div>
      </ThemeProvider>
    );
  },
};
