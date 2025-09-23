import { Meta, StoryObj } from "@storybook/react";

import { ColoredSquare, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof ColoredSquare> = {
  title: "Theme/ColoredSquare",
  component: ColoredSquare,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "color",
      description: "Background color of the square",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the square",
    },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <ColoredSquare {...args} />
      </ThemeProvider>
    );
  },
};
export default meta;

// Showcase different sizes with the same color
export const SizeComparison: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ColoredSquare color="#3B82F6" size="sm" />
          <span style={{ fontSize: "12px", color: "var(--paragraph-color)" }}>
            Small
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ColoredSquare color="#3B82F6" size="md" />
          <span style={{ fontSize: "12px", color: "var(--paragraph-color)" }}>
            Medium
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ColoredSquare color="#3B82F6" />
          <span style={{ fontSize: "12px", color: "var(--paragraph-color)" }}>
            Large
          </span>
        </div>
      </div>
    </ThemeProvider>
  ),
};

// Showcase different colors with the same size
export const ColorPalette: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <ColoredSquare color="#EF4444" size="md" />
        <ColoredSquare color="#F97316" size="md" />
        <ColoredSquare color="#F59E0B" size="md" />
        <ColoredSquare color="#EAB308" size="md" />
        <ColoredSquare color="#84CC16" size="md" />
        <ColoredSquare color="#22C55E" size="md" />
        <ColoredSquare color="#10B981" size="md" />
        <ColoredSquare color="#14B8A6" size="md" />
        <ColoredSquare color="#06B6D4" size="md" />
        <ColoredSquare color="#0EA5E9" size="md" />
        <ColoredSquare color="#3B82F6" size="md" />
        <ColoredSquare color="#6366F1" size="md" />
        <ColoredSquare color="#8B5CF6" size="md" />
        <ColoredSquare color="#A855F7" size="md" />
        <ColoredSquare color="#D946EF" size="md" />
        <ColoredSquare color="#EC4899" size="md" />
        <ColoredSquare color="#F43F5E" size="md" />
        <ColoredSquare color="#6B7280" size="md" />
      </div>
    </ThemeProvider>
  ),
};

// Usage example in context
export const InContext: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ColoredSquare color="#3B82F6" size="sm" />
          <span>
            COMPSCI 61A - The Structure and Interpretation of Computer Programs
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ColoredSquare color="#10B981" size="sm" />
          <span>MATH 1A - Calculus</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ColoredSquare color="#F59E0B" size="sm" />
          <span>PHYSICS 7A - Physics for Scientists and Engineers</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ColoredSquare color="#EF4444" size="sm" />
          <span>CHEM 1A - General Chemistry</span>
        </div>
      </div>
    </ThemeProvider>
  ),
};
