import { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ThemeProvider,
} from "@repo/theme";

const meta: Meta<typeof Accordion> = {
  title: "Theme/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Accordion Title</AccordionTrigger>
            <AccordionContent>Here is the accordion content.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ThemeProvider>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item</AccordionTrigger>
            <AccordionContent>
              This is the content for the first accordion item.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item</AccordionTrigger>
            <AccordionContent>
              This is the content for the second accordion item.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Third Item</AccordionTrigger>
            <AccordionContent>
              This is the content for the third accordion item.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ThemeProvider>
  ),
};
