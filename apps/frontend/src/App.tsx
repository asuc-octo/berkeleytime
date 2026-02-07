import { lazy } from "react";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import CatalogSkeleton from "@/app/Catalog/Skeleton";
import Layout from "@/components/Layout";
import RootWrapper from "@/components/RootWrapper";
import SuspenseBoundary from "@/components/SuspenseBoundary";
import UserProvider from "@/providers/UserProvider";

const Landing = lazy(() => import("@/app/Landing"));
const Profile = {
  Root: lazy(() => import("@/app/Profile")),
  Account: lazy(() => import("@/app/Profile/Account")),
  Support: lazy(() => import("@/app/Profile/Support")),
  Ratings: lazy(() => import("@/app/Profile/Ratings")),
  Bookmarks: lazy(() => import("@/app/Profile/Bookmarks")),
};

const CollectionDetail = lazy(
  () => import("@/app/Profile/Bookmarks/CollectionDetail")
);

const Class = {
  Enrollment: lazy(() => import("@/components/Class/Enrollment")),
  Grades: lazy(() => import("@/components/Class/Grades")),
  Overview: lazy(() => import("@/components/Class/Overview")),
  Sections: lazy(() => import("@/components/Class/Sections")),
  Ratings: lazy(() => import("@/components/Class/Ratings")),
  Discussion: lazy(() => import("@/components/Class/Discussion")),
};

const Catalog = lazy(() => import("@/app/Catalog"));
const Enrollment = lazy(() => import("@/app/Enrollment"));
const GradeDistributions = lazy(() => import("@/app/GradeDistributions"));
const About = lazy(() => import("@/app/About"));
// const Discover = lazy(() => import("@/app/Discover"));
const CuratedClasses = lazy(() => import("@/app/CuratedClasses"));
const Privacy = lazy(() => import("@/app/Legal/Privacy"));
const Terms = lazy(() => import("@/app/Legal/Terms"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
// const Map = lazy(() => import("@/app/Map"));
const GradTrak = lazy(() => import("@/app/GradTrak"));
const GradTrakOnboarding = lazy(() => import("@/app/GradTrak/Onboarding"));
const GradTrakDashboard = lazy(() => import("@/app/GradTrak/Dashboard"));
const NotFound = lazy(() => import("@/app/NotFound"));

const router = createBrowserRouter([
  {
    element: <RootWrapper />,
    children: [
      {
        element: <Layout banner={false} header={false} footer={false} />,
        children: [
          // {
          //   element: (
          //       <SuspenseBoundary key="schedules/:scheduleId">
          //         <Discover />
          //       </SuspenseBoundary>
          // ),
          //   path: "discover",
          // },
          {
            element: (
              <SuspenseBoundary key="landing">
                <Landing />
              </SuspenseBoundary>
            ),
            index: true,
          },
          {
            element: (
              <SuspenseBoundary key="schedules/:scheduleId">
                <Schedule />
              </SuspenseBoundary>
            ),
            path: "schedules/:scheduleId",
            children: [
              {
                element: (
                  <SuspenseBoundary key="overview">
                    <Manage />
                  </SuspenseBoundary>
                ),
                index: true,
              },
              {
                element: (
                  <SuspenseBoundary key="compare">
                    <Compare />
                  </SuspenseBoundary>
                ),
                path: "compare/:comparisonId?",
              },
              {
                path: "*",
                loader: ({ params: { scheduleId } }) =>
                  redirect(`/schedules/${scheduleId}`),
              },
            ],
          },
          // {
          //   element: (
          //     <SuspenseBoundary key="map">
          //       <Map />
          //     </SuspenseBoundary>
          //   ),
          //   path: "map",
          // },
        ],
      },
      {
        path: "gradtrak",
        element: <Layout footer={false} />,
        children: [
          {
            index: true,
            element: (
              <SuspenseBoundary key="gradtrak-landing">
                <GradTrak />
              </SuspenseBoundary>
            ),
          },
          {
            path: "onboarding",
            element: (
              <SuspenseBoundary key="gradtrak-onboarding">
                <GradTrakOnboarding />
              </SuspenseBoundary>
            ),
          },
          {
            path: "dashboard",
            element: (
              <SuspenseBoundary key="gradtrak-dashboard">
                <GradTrakDashboard />
              </SuspenseBoundary>
            ),
          },
          {
            path: "*",
            loader: () => redirect("/gradtrak"),
          },
        ],
      },
      {
        element: <Layout />,
        children: [
          {
            path: "curated",
            element: (
              <SuspenseBoundary key="curated">
                <CuratedClasses />
              </SuspenseBoundary>
            ),
          },
          {
            path: "about",
            element: (
              <SuspenseBoundary key="about">
                <About />
              </SuspenseBoundary>
            ),
          },
          {
            path: "legal/privacy",
            element: (
              <SuspenseBoundary key="privacy">
                <Privacy />
              </SuspenseBoundary>
            ),
          },
          {
            path: "legal/terms",
            element: (
              <SuspenseBoundary key="terms">
                <Terms />
              </SuspenseBoundary>
            ),
          },
        ],
      },
      {
        element: <Layout footer={false} scrollLock />,
        children: [
          {
            element: (
              <SuspenseBoundary key="profile">
                <Profile.Root />
              </SuspenseBoundary>
            ),
            path: "profile",
            children: [
              {
                element: (
                  <SuspenseBoundary key="account">
                    <Profile.Account />
                  </SuspenseBoundary>
                ),
                index: true,
              },
              {
                element: (
                  <SuspenseBoundary key="support">
                    <Profile.Support />
                  </SuspenseBoundary>
                ),
                path: "support",
              },
              {
                element: (
                  <SuspenseBoundary key="ratings">
                    <Profile.Ratings />
                  </SuspenseBoundary>
                ),
                path: "ratings",
              },
              {
                element: (
                  <SuspenseBoundary key="bookmarks">
                    <Profile.Bookmarks />
                  </SuspenseBoundary>
                ),
                path: "bookmarks",
              },
            ],
          },
        ],
      },
      {
        element: <Layout footer={false} />,
        children: [
          {
            element: (
              <SuspenseBoundary key="collection">
                <CollectionDetail />
              </SuspenseBoundary>
            ),
            path: "collection/:id/:subject?/:courseNumber?/:number?",
            children: [
              {
                element: (
                  <SuspenseBoundary key="overview">
                    <Class.Overview />
                  </SuspenseBoundary>
                ),
                index: true,
              },
              {
                element: (
                  <SuspenseBoundary key="sections">
                    <Class.Sections />
                  </SuspenseBoundary>
                ),
                path: "sections",
              },
              {
                element: (
                  <SuspenseBoundary key="enrollment">
                    <Class.Enrollment />
                  </SuspenseBoundary>
                ),
                path: "enrollment",
              },
              {
                element: (
                  <SuspenseBoundary key="grades">
                    <Class.Grades />
                  </SuspenseBoundary>
                ),
                path: "grades",
              },
              {
                element: (
                  <SuspenseBoundary key="ratings">
                    <Class.Ratings />
                  </SuspenseBoundary>
                ),
                path: "ratings",
              },
              {
                element: (
                  <SuspenseBoundary key="discussion">
                    <Class.Discussion />
                  </SuspenseBoundary>
                ),
                path: "discussion",
              },
            ],
          },
          {
            element: (
              <SuspenseBoundary key="grades">
                <GradeDistributions />
              </SuspenseBoundary>
            ),
            path: "grades",
          },
          {
            element: (
              <SuspenseBoundary key="enrollment">
                <Enrollment />
              </SuspenseBoundary>
            ),
            path: "enrollment",
          },
          {
            element: (
              <SuspenseBoundary
                key="catalog/:year?/:semester?/:subject?/:courseNumber?/:number?/:sessionId?"
                fallback={<CatalogSkeleton />}
              >
                <Catalog />
              </SuspenseBoundary>
            ),
            path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:number?/:sessionId?",
            children: [
              {
                element: (
                  <SuspenseBoundary key="overview">
                    <Class.Overview />
                  </SuspenseBoundary>
                ),
                index: true,
              },
              {
                element: (
                  <SuspenseBoundary key="sections">
                    <Class.Sections />
                  </SuspenseBoundary>
                ),
                path: "sections",
              },
              {
                element: (
                  <SuspenseBoundary key="enrollment">
                    <Class.Enrollment />
                  </SuspenseBoundary>
                ),
                path: "enrollment",
              },
              {
                element: (
                  <SuspenseBoundary key="grades">
                    <Class.Grades />
                  </SuspenseBoundary>
                ),
                path: "grades",
              },
              {
                element: (
                  <SuspenseBoundary key="ratings">
                    <Class.Ratings />
                  </SuspenseBoundary>
                ),
                path: "ratings",
              },
              {
                element: (
                  <SuspenseBoundary key="discussion">
                    <Class.Discussion />
                  </SuspenseBoundary>
                ),
                path: "discussion",
              },
              {
                path: "*",
                loader: ({
                  params: {
                    year,
                    semester,
                    subject,
                    courseNumber,
                    number,
                    sessionId,
                  },
                }) => {
                  const basePath = `/catalog/${year}/${semester}/${subject}/${courseNumber}`;
                  return redirect(
                    number && sessionId
                      ? `${basePath}/${number}/${sessionId}`
                      : basePath
                  );
                },
              },
            ],
          },
          {
            element: (
              <SuspenseBoundary key="schedules">
                <Schedules />
              </SuspenseBoundary>
            ),
            path: "schedules",
          },
        ],
      },
      {
        element: <Layout />,
        children: [
          {
            path: "*",
            element: (
              <SuspenseBoundary key="not-found">
                <NotFound />
              </SuspenseBoundary>
            ),
          },
        ],
      },
    ],
  },
]);

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          class: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
      PlanTerm: {
        fields: {
          courses: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
      Schedule: {
        fields: {
          events: {
            merge(_, incoming) {
              return incoming;
            },
          },
          classes: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </UserProvider>
    </ApolloProvider>
  );
}
