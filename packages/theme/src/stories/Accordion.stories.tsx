import { Meta, StoryObj } from "@storybook/react";

import { Accordion } from "../components/Accordion";

const meta: Meta<typeof Accordion.Root> = {
  title: "Theme/Accordion",
  component: Accordion.Root,
  parameters: {
    layout: "centered",
    background: "dark",
  },
};
export default meta;

type Story = StoryObj<typeof Accordion.Root>;

export const Default: Story = {
  render: () => (
    <Accordion.Root>
      <Accordion.Details>
        <Accordion.Summary>Accordion Title</Accordion.Summary>
        <Accordion.Content>Here is the accordion content.</Accordion.Content>
      </Accordion.Details>
    </Accordion.Root>
  ),
};
