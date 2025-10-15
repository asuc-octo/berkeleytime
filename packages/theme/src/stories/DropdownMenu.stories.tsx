import { Meta, StoryObj } from "@storybook/react";
import {
  Copy,
  Download,
  Edit,
  LogOut,
  MoreHoriz,
  Settings,
  ShareIos,
  Trash,
  User,
} from "iconoir-react";
import { fn } from "storybook/test";

import { Button, DropdownMenu, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof DropdownMenu.Root> = {
  title: "Theme/DropdownMenu",
  component: DropdownMenu.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
  },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <MoreHoriz />
            Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>
            <Edit
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <Copy
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Copy
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <ShareIos
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Share
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>
            <Trash
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const WithIcons: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="tertiary">
            <MoreHoriz />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>
            <Edit
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Edit Item
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <Copy
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <Download
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Download
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>
            <Settings
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Settings
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const UserMenu: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <User
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            John Doe
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>
            <User
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <Settings
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Settings
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>
            <LogOut
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const CourseActions: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="tertiary" noFill>
            <MoreHoriz />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>View Details</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Add to Schedule</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Bookmark</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>
            <ShareIos
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Share Course
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <Download
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Export Info
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const LongMenu: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <MoreHoriz />
            More Options
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>Option 1</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 2</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 3</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>Option 4</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 5</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 6</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()}>Option 7</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 8</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 9</DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>Option 10</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const DisabledItems: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <MoreHoriz />
            Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={fn()}>
            <Edit
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()} disabled>
            <Copy
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Copy (Disabled)
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={fn()}>
            <ShareIos
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Share
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={fn()} disabled>
            <Trash
              style={{ marginRight: "8px", width: "16px", height: "16px" }}
            />
            Delete (Disabled)
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ThemeProvider>
  ),
};

export const InContext: StoryObj = {
  render: () => (
    <ThemeProvider>
      <div
        style={{
          padding: "20px",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          backgroundColor: "var(--foreground-color)",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            COMPSCI 61A
          </h3>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="tertiary" noFill>
                <MoreHoriz />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={fn()}>View Details</DropdownMenu.Item>
              <DropdownMenu.Item onClick={fn()}>
                Add to Schedule
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={fn()}>Bookmark</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onClick={fn()}>
                <ShareIos
                  style={{ marginRight: "8px", width: "16px", height: "16px" }}
                />
                Share
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "var(--paragraph-color)",
          }}
        >
          The Structure and Interpretation of Computer Programs
        </p>
        <div
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "var(--paragraph-color)",
          }}
        >
          4 units • Fall 2024
        </div>
      </div>
    </ThemeProvider>
  ),
};
