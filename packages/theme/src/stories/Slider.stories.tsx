import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Slider, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Slider> = {
  title: "Theme/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    const [value, setValue] = useState<[number, number]>([20, 80]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={100}
            step={1}
            value={value}
            onValueChange={setValue}
          />
          <div style={{ marginTop: "8px", fontSize: "14px", color: "var(--gray-11)" }}>
            Value: [{value[0]}, {value[1]}]
          </div>
        </div>
      </ThemeProvider>
    );
  },
};

export const WithDefaultValue: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[25, 75]}
          />
        </div>
      </ThemeProvider>
    );
  },
};

export const WithLabels: StoryObj = {
  render: () => {
    const [value, setValue] = useState<[number, number]>([2, 4]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={5}
            step={1}
            value={value}
            onValueChange={setValue}
            labels={["0", "1", "2", "3", "4", "5"]}
          />
          <div style={{ marginTop: "24px", fontSize: "14px", color: "var(--gray-11)" }}>
            Value: [{value[0]}, {value[1]}]
          </div>
        </div>
      </ThemeProvider>
    );
  },
};

export const RatingScale: StoryObj = {
  render: () => {
    const [value, setValue] = useState<[number, number]>([3, 5]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={1}
            max={5}
            step={1}
            value={value}
            onValueChange={setValue}
            labels={["1", "2", "3", "4", "5"]}
          />
          <div style={{ marginTop: "24px", fontSize: "14px", color: "var(--gray-11)" }}>
            Rating range: {value[0]} - {value[1]} stars
          </div>
        </div>
      </ThemeProvider>
    );
  },
};

export const SmallRange: StoryObj = {
  render: () => {
    const [value, setValue] = useState<[number, number]>([10, 20]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={50}
            step={5}
            value={value}
            onValueChange={setValue}
          />
          <div style={{ marginTop: "8px", fontSize: "14px", color: "var(--gray-11)" }}>
            Value: [{value[0]}, {value[1]}]
          </div>
        </div>
      </ThemeProvider>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[30, 70]}
            disabled
          />
        </div>
      </ThemeProvider>
    );
  },
};

export const DecimalSteps: StoryObj = {
  render: () => {
    const [value, setValue] = useState<[number, number]>([0.2, 0.8]);

    return (
      <ThemeProvider>
        <div style={{ width: "300px" }}>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={value}
            onValueChange={setValue}
          />
          <div style={{ marginTop: "8px", fontSize: "14px", color: "var(--gray-11)" }}>
            Value: [{value[0].toFixed(1)}, {value[1].toFixed(1)}]
          </div>
        </div>
      </ThemeProvider>
    );
  },
};
