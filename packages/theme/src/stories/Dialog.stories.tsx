import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { Button, Dialog, ThemeProvider } from "@repo/theme";

const meta: Meta<typeof Dialog.Root> = {
  title: "Theme/Dialog",
  component: Dialog.Root,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
  },
};
export default meta;

export const WithDeleteAction: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <ThemeProvider>
        <div style={{ width: "500px", height: "500px" }}>
          <Button onClick={() => setOpen(true)}>Open Delete Dialog</Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Overlay />
          <Dialog.Card>
            <Dialog.Header title="Delete Item" hasCloseButton onDelete={fn()} />
            <Dialog.Body>
              <p>
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" isDelete onClick={() => setOpen(false)}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Root>
      </ThemeProvider>
    );
  },
};

export const DrawerEnd: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <ThemeProvider>
        <div style={{ width: "500px", height: "500px" }}>
          <Button onClick={() => setOpen(true)}>Open Right Drawer</Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Overlay />
          <Dialog.Drawer align="end">
            <Dialog.Header
              title="Settings"
              subtitle="Configure your preferences"
              hasCloseButton
            />
            <Dialog.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Theme
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Notifications
                  </label>
                  <input type="checkbox" style={{ marginRight: "8px" }} />
                  Enable notifications
                </div>
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </Dialog.Footer>
          </Dialog.Drawer>
        </Dialog.Root>
      </ThemeProvider>
    );
  },
};

export const DrawerStart: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <ThemeProvider>
        <div style={{ width: "500px", height: "500px" }}>
          <Button onClick={() => setOpen(true)}>Open Left Drawer</Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Overlay />
          <Dialog.Drawer align="start">
            <Dialog.Header
              title="Navigation"
              subtitle="Browse the application"
              hasCloseButton
            />
            <Dialog.Body>
              <nav
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <a
                  href="#"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "var(--paragraph-color)",
                  }}
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "var(--paragraph-color)",
                  }}
                >
                  Courses
                </a>
                <a
                  href="#"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "var(--paragraph-color)",
                  }}
                >
                  Schedules
                </a>
                <a
                  href="#"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "var(--paragraph-color)",
                  }}
                >
                  Profile
                </a>
              </nav>
            </Dialog.Body>
          </Dialog.Drawer>
        </Dialog.Root>
      </ThemeProvider>
    );
  },
};

export const CustomContent: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <ThemeProvider>
        <div style={{ width: "500px", height: "500px" }}>
          <Button onClick={() => setOpen(true)}>Open Custom Dialog</Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Overlay />
          <Dialog.Card>
            <Dialog.Header>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "var(--blue-500)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  !
                </div>
                <div>
                  <h2
                    style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                  >
                    Custom Header
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "var(--paragraph-color)",
                    }}
                  >
                    This dialog has a custom header layout
                  </p>
                </div>
                <Dialog.Close asChild>
                  <Button variant="tertiary" noFill>
                    ×
                  </Button>
                </Dialog.Close>
              </div>
            </Dialog.Header>
            <Dialog.Body>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p>This dialog demonstrates custom content layout.</p>
                <div
                  style={{
                    margin: "20px 0",
                    padding: "16px",
                    backgroundColor: "var(--background-color)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <strong>Custom Content Area</strong>
                </div>
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Root>
      </ThemeProvider>
    );
  },
};

export const FormDialog: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <ThemeProvider>
        <div style={{ width: "500px", height: "500px" }}>
          <Button onClick={() => setOpen(true)}>Open Form Dialog</Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Overlay />
          <Dialog.Card>
            <Dialog.Header
              title="Create New Course"
              subtitle="Add a new course to your schedule"
              hasCloseButton
            />
            <Dialog.Body>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., COMPSCI 61A"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., The Structure and Interpretation of Computer Programs"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Units
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      fontSize: "14px",
                    }}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Create Course</Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Root>
      </ThemeProvider>
    );
  },
};
