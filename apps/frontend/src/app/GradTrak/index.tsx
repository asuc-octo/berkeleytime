import { useEffect, useMemo } from "react";

import { ArrowRight, Plus } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Boundary,
  Box,
  Button,
  Container,
  LoadingIndicator,
} from "@repo/theme";

import Footer from "@/components/Footer";
import { useReadPlans } from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";

import styles from "./GradTrak.module.scss";

export default function GradTrakIndex() {
  const { user, loading: userLoading } = useUser();

  const { data: gradTraks, loading: gradTraksLoading } = useReadPlans({
    skip: !user,
  });

  const navigate = useNavigate();

  const hasGradTraks = useMemo(() => {
    return (
      !gradTraksLoading &&
      gradTraks !== null &&
      gradTraks !== undefined &&
      gradTraks.length > 0
    );
  }, [gradTraks, gradTraksLoading]);

  useEffect(() => {
    if (user && !userLoading && !gradTraksLoading && hasGradTraks) {
      const latestGradTrak = gradTraks?.[0];

      if (latestGradTrak) {
        navigate(`/gradtrak/dashboard`);
      } else {
        console.error(
          "hasGradTraks was true but no GradTrak ID found in data."
        );
        navigate("/gradtrak/onboarding", { replace: true });
      }
    }
  }, [user, userLoading, gradTraksLoading, hasGradTraks, gradTraks, navigate]);

  if (userLoading || (user && (gradTraksLoading || hasGradTraks))) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  return (
    <Box p="5">
      <Container style={{ marginBottom: "80px" }}>
        <div className={styles.header}>
          <div className={styles.title}>Welcome to Berkeleytime's GradTrak</div>
          <div className={styles.prompt}>
            Use our GradTrak to build your ideal 4-year plan. Find courses,
            track requirements, and visualize your academic journey.
          </div>
          {user ? (
            <Button
              variant="primary"
              onClick={() => navigate("/gradtrak/onboarding")}
            >
              <Plus />
              Create a GradTrak
            </Button>
          ) : (
            <Button onClick={() => signIn()}>
              Sign in
              <ArrowRight />
            </Button>
          )}
        </div>
      </Container>
      <Footer />
    </Box>
  );
}
