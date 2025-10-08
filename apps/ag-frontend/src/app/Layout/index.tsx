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
import { LogOut } from "iconoir-react";
import { Link, Outlet } from "react-router-dom";

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
      <Box px="6" py="3" className={styles.header}>
        <Container>
          <Flex justify="between">
            <Heading className={styles.heading} asChild>
              <Link to="/">Berkeley Catalog</Link>
            </Heading>
            <Button
              variant="outline"
              color="gray"
              onClick={() => signOut(BASE)}
            >
              Sign out
              <LogOut />
            </Button>
          </Flex>
        </Container>
      </Box>
      <Separator size="4" />
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
