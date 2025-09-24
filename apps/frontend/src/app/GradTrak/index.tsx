import { useMemo, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { Plus } from "iconoir-react"; 

import { 
  Box, 
  Boundary,
  Button, 
  Container,
  LoadingIndicator
} from "@repo/theme";
import { useReadPlans, useReadUser } from "@/hooks/api"; 
import { signIn, DegreeOption } from "@/lib/api"; 
import Footer from "@/components/Footer";

import styles from "./GradTrak.module.scss"; 

export default function GradTrakIndex() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: gradTraks, loading: gradTraksLoading } = useReadPlans({
    skip: !user, 
  });

  console.log(gradTraks);

  const navigate = useNavigate(); 

  const hasGradTraks = useMemo(() => {
      return !gradTraksLoading && gradTraks !== null && gradTraks !== undefined && gradTraks.length > 0;
  }, [gradTraks, gradTraksLoading]);

  useEffect(() => {
      if (user && !userLoading && !gradTraksLoading && hasGradTraks) {
          console.log("User has existing GradTraks, redirecting to dashboard.");
          const latestGradTrak = gradTraks?.[0]; 

          if (latestGradTrak) {
            navigate(`/gradtrak/dashboard`, {
              state: {  // TODO(Daniel): modify this to use the stored info, not just start and end dates
                startYear: '0',
                gradYear: '0',
                summerCheck: false,
                selectedDegreeList: latestGradTrak.majors.map((major): DegreeOption => ({ label: major, value: major })),
                selectedMinorList: latestGradTrak.minors.map((minor): DegreeOption => ({ label: minor, value: minor })),
              },
            }); 
          } else {
             console.error("hasGradTraks was true but no GradTrak ID found in data.");
             navigate('/gradtrak/onboarding', { replace: true });
          }
      }
  }, [user, userLoading, gradTraksLoading, hasGradTraks, gradTraks, navigate]);

  if (userLoading || gradTraksLoading) {
    console.log("Loading GradTrak data")
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    ); 
  }

  if (!user) {
     signIn();
     return <></>; 
  }

  if (hasGradTraks) {
    console.log("Loading user's GradTrak")
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
          <div className={styles.title}>
            Welcome to Berkeleytime's GradTrak
          </div>
          <div className={styles.prompt}>
            Use our GradTrak to build your ideal 4-year plan.
            Find courses, track requirements, and visualize your academic journey.
          </div>
            <Button variant="primary" onClick={() => navigate('/gradtrak/onboarding')}>
              <Plus />
              Create a GradTrak
            </Button>
        </div>
      </Container>
      <Footer />
    </Box>
  );
}