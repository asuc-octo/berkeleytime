import { useState } from "react";

import { Button, Container, Flex } from "@repo/theme";

import ConfirmationToast from "./ConfirmationToast";

export default function BookmarkDashboard() {
  const [toastOpen, setToastOpen] = useState(false);

  const handleClick = () => {
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3000);
  };

  return (
    <Container>
      <Flex direction="column" gap="4" p="5" align="center" justify="center" style={{ minHeight: "50vh" }}>
        <h1>Toast Test</h1>
        <Button onClick={handleClick}>Show Toast</Button>
      </Flex>

      <ConfirmationToast
        message="Course bookmarked successfully!"
        open={toastOpen}
        onOpenChange={setToastOpen}
      />
    </Container>
  );
}
