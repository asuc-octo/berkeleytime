import { Box, Container } from "@repo/theme";
import { Outlet } from "react-router-dom";

import { useReadSchedules, useReadUser } from "@/hooks/api";
import { signIn } from "@/lib/api";

import styles from "./GradTrak.module.scss";

export default function GradTrak() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  if (userLoading || schedulesLoading) return <></>;

  if (!user) signIn();

  if (!schedules) {
    return <></>;
  }

  return (
    <Box p="5">
      <Container size="3">
        <Outlet />  
      </Container>
    </Box>
  );
}
