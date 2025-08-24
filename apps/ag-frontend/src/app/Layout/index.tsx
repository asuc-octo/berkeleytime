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

import styles from "./Layout.module.scss";

const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};

const signOut = async (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
};

function Content() {
  const { data, loading, error } = useReadUser();

  useEffect(() => {
    if (loading || error || data?.staff) return;

    if (!data) {
      signIn();

      return;
    }

    window.location.href = import.meta.env.DEV
      ? "http://localhost:8080"
      : "https://berkeleytime.com";
  }, [data, error, loading]);

  // Include redirect for invalid authentication
  if (loading || (!error && !data?.staff)) {
    return (
      <Flex align="center" justify="center" flexGrow="1">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (data) {
    return (
      <Flex direction="column" flexGrow="1">
        <Box px="3">
          <Container>
            <Flex>
              <Heading>Academic Guide</Heading>
              <Button
                onClick={() =>
                  signOut(
                    import.meta.env.DEV
                      ? "http://localhost:8080"
                      : "https://berkeleytime.com"
                  )
                }
              >
                Sign out
              </Button>
            </Flex>
          </Container>
        </Box>
        <Separator />
        <Outlet />
      </Flex>
    );
  }

  return null;
}

export default function Layout() {
  return (
    <Flex direction="column" className={styles.root}>
      <Content />
    </Flex>
  );
}
