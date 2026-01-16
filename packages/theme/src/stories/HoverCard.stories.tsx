import { Meta, StoryObj } from "@storybook/react";

import { Button, HoverCard, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof HoverCard> = {
  title: "Theme/HoverCard",
  component: HoverCard,
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
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard content="This is a basic hover card with simple text content.">
        <Button variant="tertiary">Hover me</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const WithData: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="COMPSCI 61A"
        data={[
          { label: "Units", value: "4" },
          { label: "Semester", value: "Fall 2024" },
          { label: "Enrollment", value: "850/900" },
        ]}
      >
        <Button variant="tertiary">Course Info</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const WithColoredData: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="COMPSCI 61A"
        data={[
          { label: "Difficulty", value: "Medium", color: "#F59E0B" },
          { label: "Workload", value: "High", color: "#EF4444" },
          { label: "Overall Rating", value: "Excellent", color: "#10B981" },
        ]}
      >
        <Button variant="tertiary">Course Ratings</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const CourseDetails: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="The Structure and Interpretation of Computer Programs"
        data={[
          { label: "Subject", value: "COMPSCI" },
          { label: "Number", value: "61A" },
          { label: "Units", value: "4" },
          { label: "Semester", value: "Fall 2024" },
          { label: "Enrolled", value: "850/900" },
          { label: "Waitlist", value: "45/50" },
        ]}
      >
        <Button variant="tertiary">COMPSCI 61A</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const ProfessorInfo: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="Dr. John Smith"
        data={[
          { label: "Department", value: "Computer Science" },
          { label: "Office", value: "Soda Hall 387" },
          { label: "Email", value: "jsmith@berkeley.edu" },
          { label: "Office Hours", value: "MWF 2-3 PM" },
        ]}
      >
        <Button variant="tertiary">Professor</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const ScheduleInfo: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="Fall 2024 Schedule"
        data={[
          { label: "COMPSCI 61A", value: "MWF 10-11 AM", color: "#3B82F6" },
          { label: "MATH 1A", value: "TTh 2-3 PM", color: "#10B981" },
          { label: "PHYSICS 7A", value: "MWF 1-2 PM", color: "#F59E0B" },
        ]}
      >
        <Button variant="tertiary">My Schedule</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};

export const GradeDistribution: StoryObj = {
  render: () => (
    <ThemeProvider>
      <HoverCard
        content="Grade Distribution"
        data={[
          { label: "A+", value: "15%", color: "#10B981" },
          { label: "A", value: "25%", color: "#10B981" },
          { label: "A-", value: "20%", color: "#10B981" },
          { label: "B+", value: "15%", color: "#3B82F6" },
          { label: "B", value: "10%", color: "#3B82F6" },
          { label: "B-", value: "8%", color: "#3B82F6" },
          { label: "C+", value: "4%", color: "#F59E0B" },
          { label: "C", value: "2%", color: "#F59E0B" },
          { label: "C-", value: "1%", color: "#F59E0B" },
        ]}
      >
        <Button variant="tertiary">Grade Distribution</Button>
      </HoverCard>
    </ThemeProvider>
  ),
};
