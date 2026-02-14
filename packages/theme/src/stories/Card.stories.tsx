import { Meta, StoryObj } from "@storybook/react";
import {
  ArrowRight,
} from "iconoir-react";
import { fn } from "storybook/test";

import { Button, Card, Color, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Card.Root> = {
  title: "Theme/Card",
  component: Card.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean" },
    disabled: { control: "boolean" },
    hoverColorChange: { control: "boolean" },
  },
  render: (args: any) => {
    return (
      <ThemeProvider>
        <div style={{ width: "400px" }}>
          <Card.Root {...args}>
            <Card.Body>
              <Card.Heading>Card Heading</Card.Heading>
              <Card.Description>
                This is a card description that explains what the card contains.
              </Card.Description>
              <Card.Footer>Footer content</Card.Footer>
            </Card.Body>
            <Card.Actions>
              <Card.ActionIcon onClick={fn()}>
                <ArrowRight />
              </Card.ActionIcon>
            </Card.Actions>
          </Card.Root>
        </div>
      </ThemeProvider>
    );
  },
};
export default meta;

// Basic Card Stories
export const Basic: StoryObj = {
  args: {},
};

export const Active: StoryObj = {
  args: {
    active: true,
  },
};

export const Disabled: StoryObj = {
  args: {
    disabled: true,
  },
};

export const WithLeftBorder: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Card.Root>
          <Card.LeftBorder color={Color.Blue} />
          <Card.Body>
            <Card.Heading>Card with Left Border</Card.Heading>
            <Card.Description>
              This card has a colored left border.
            </Card.Description>
          </Card.Body>
        </Card.Root>
      </div>
    </ThemeProvider>
  ),
};

export const ColumnLayout: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Card.RootColumn>
          <Card.ColumnHeader>
            <Card.Body>
              <Card.Heading>Column Layout Card</Card.Heading>
              <Card.Description>
                This card uses a column layout structure.
              </Card.Description>
            </Card.Body>
            <Card.Actions>
              <Button variant="tertiary" noFill>
                Action <ArrowRight />
              </Button>
            </Card.Actions>
          </Card.ColumnHeader>
          <Card.ColumnBody>
            <p>Additional content in the column body section.</p>
          </Card.ColumnBody>
        </Card.RootColumn>
      </div>
    </ThemeProvider>
  ),
};
