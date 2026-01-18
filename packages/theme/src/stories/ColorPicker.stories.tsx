import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Color, ColorPicker, ThemeProvider } from "@repo/theme";

const allColors: Color[] = [
  Color.Slate,
  Color.Gray,
  Color.Zinc,
  Color.Neutral,
  Color.Stone,
  Color.Red,
  Color.Orange,
  Color.Amber,
  Color.Yellow,
  Color.Lime,
  Color.Green,
  Color.Emerald,
  Color.Teal,
  Color.Cyan,
  Color.Sky,
  Color.Blue,
  Color.Indigo,
  Color.Violet,
  Color.Purple,
  Color.Fuchsia,
  Color.Pink,
  Color.Rose,
];

const meta: Meta<typeof ColorPicker> = {
  title: "Theme/ColorPicker",
  component: ColorPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    allowNull: { control: "boolean" },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Color | null>(Color.Blue);

    return (
      <ThemeProvider>
        <ColorPicker
          value={value}
          onChange={setValue}
          colors={allColors}
        />
      </ThemeProvider>
    );
  },
};

export const NoColor: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Color | null>(null);

    return (
      <ThemeProvider>
        <ColorPicker
          value={value}
          onChange={setValue}
          colors={allColors}
        />
      </ThemeProvider>
    );
  },
};

export const LimitedColors: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Color | null>(Color.Green);

    const limitedColors: Color[] = [
      Color.Red,
      Color.Orange,
      Color.Yellow,
      Color.Green,
      Color.Blue,
      Color.Purple,
      Color.Pink,
    ];

    return (
      <ThemeProvider>
        <ColorPicker
          value={value}
          onChange={setValue}
          colors={limitedColors}
        />
      </ThemeProvider>
    );
  },
};

export const WithoutNullOption: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Color | null>(Color.Indigo);

    return (
      <ThemeProvider>
        <ColorPicker
          value={value}
          onChange={setValue}
          colors={allColors}
          allowNull={false}
        />
      </ThemeProvider>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ColorPicker
            value={Color.Blue}
            onChange={() => {}}
            colors={allColors}
            disabled
          />
          <ColorPicker
            value={null}
            onChange={() => {}}
            colors={allColors}
            disabled
          />
        </div>
      </ThemeProvider>
    );
  },
};
