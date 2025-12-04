import { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Theme/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    background: "dark",
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Accordion Title</AccordionTrigger>
        <AccordionContent>Here is the accordion content.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Another Item</AccordionTrigger>
        <AccordionContent>More content here.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
