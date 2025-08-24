import { useEffect } from "react";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Separator,
  Spinner,
} from "@radix-ui/themes";
import { Outlet } from "react-router-dom";

import { useReadUser } from "@/hooks/api";
import { BASE, signIn, signOut } from "@/lib/api";

import styles from "./Layout.module.scss";

function Content() {
  const { data, loading } = useReadUser();

  useEffect(() => {
    if (loading || data?.staff) return;

    if (!data) {
      signIn();

      return;
    }

    window.location.href = BASE;
  }, [data, loading]);

  // Include redirect for invalid authentication
  if (loading || !data) {
    return (
      <Flex align="center" justify="center" flexGrow="1">
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" flexGrow="1">
      <Box px="3">
        <Container>
          <Flex>
            <Heading>Academic Guide</Heading>
            <Button onClick={() => signOut(BASE)}>Sign out</Button>
          </Flex>
        </Container>
      </Box>
      <Separator />
      <Outlet />
    </Flex>
  );
}

export default function Layout() {
  return (
    <Flex direction="column" className={styles.root}>
      <Content />
    </Flex>
  );
}
