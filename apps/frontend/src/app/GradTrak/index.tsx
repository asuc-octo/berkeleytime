import { useMemo, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import React from "react"; 

import { Plus } from "iconoir-react"; 

// Keep basic layout components from @repo/theme
import { Box, Button, Container } from "@repo/theme";

const useReadGradTraks = (options: { skip: boolean }) => {
    const [data, setData] = React.useState<IGradTrak[] | null>(null);
    const [loading, setLoading] = React.useState(!options.skip); 

    useEffect(() => {
        if (!options.skip) {
            setLoading(true); 
            const timer = setTimeout(() => {
                setData([]);

                setLoading(false);
            }, 500); 
            return () => clearTimeout(timer);
        } else {
             setLoading(false); 
             setData(null); 
        }
    }, [options.skip]); 

    return { data, loading };
};

// Mock IGradTrak type 
interface IGradTrak {
    _id: string;
    name: string;
    year: number;
    semester: 'Fall' | 'Spring' | 'Summer';
    semesters: { [key: string]: any[] };
}

import { useReadUser } from "@/hooks/api"; 
import { signIn } from "@/lib/api"; 

import Footer from "@/components/Footer";

import styles from "./GradTrak.module.scss"; 

export default function GradTrakIndex() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: gradTraks, loading: gradTraksLoading } = useReadGradTraks({
    skip: !user, 
  });

  const navigate = useNavigate(); // Get navigate function

  const hasGradTraks = useMemo(() => {
      return !gradTraksLoading && gradTraks !== null && gradTraks !== undefined && gradTraks.length > 0;
  }, [gradTraks, gradTraksLoading]);

  useEffect(() => {
      if (user && !userLoading && !gradTraksLoading && hasGradTraks) {
          console.log("User has existing GradTraks, redirecting to dashboard.");
          const latestGradTrakId = gradTraks?.[0]?._id; 

          if (latestGradTrakId) {
              navigate(`/gradtrak/dashboard/${latestGradTrakId}`, { replace: true }); 
          } else {
             console.error("hasGradTraks was true but no GradTrak ID found in data.");
             navigate('/gradtrak/onboarding', { replace: true });
          }
      }
  }, [user, userLoading, gradTraksLoading, hasGradTraks, gradTraks, navigate]);

  if (userLoading || gradTraksLoading) {
    return <p>Loading GradTrak data...</p>; 
  }

  if (!user) {
     signIn();
     return <></>; 
  }

  if (hasGradTraks) {
    return <p>Loading your GradTrak...</p>; 
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
            <Button variant="solid" onClick={() => navigate('/gradtrak/onboarding')}>
              <Plus />
              Create a GradTrak
            </Button>
        </div>
      </Container>
      <Footer />
    </Box>
  );
}