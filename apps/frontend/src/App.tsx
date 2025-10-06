import { lazy } from "react";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Landing from "@/app/Landing";
import Layout from "@/components/Layout";
import SuspenseBoundary from "@/components/SuspenseBoundary";

// import PinsProvider from "@/components/PinsProvider";

const Profile = {
  Root: lazy(() => import("@/app/Profile")),
  Account: lazy(() => import("@/app/Profile/Account")),
  Support: lazy(() => import("@/app/Profile/Support")),
  Ratings: lazy(() => import("@/app/Profile/Ratings")),
};

const Class = {
  Enrollment: lazy(() => import("@/components/Class/Enrollment")),
  Grades: lazy(() => import("@/components/Class/Grades")),
  Overview: lazy(() => import("@/components/Class/Overview")),
  Sections: lazy(() => import("@/components/Class/Sections")),
  Ratings: lazy(() => import("@/components/Class/Ratings")),
};

const Course = {
  Root: lazy(() => import("@/app/Course")),
  Enrollment: lazy(() => import("@/components/Course/Enrollment")),
  Grades: lazy(() => import("@/components/Course/Grades")),
  Overview: lazy(() => import("@/components/Course/Overview")),
  Classes: lazy(() => import("@/components/Course/Classes")),
};

const Catalog = lazy(() => import("@/app/Catalog"));
const Enrollment = lazy(() => import("@/app/Enrollment"));
const GradeDistributions = lazy(() => import("@/app/GradeDistributions"));
const About = lazy(() => import("@/app/About"));
// const Discover = lazy(() => import("@/app/Discover"));
const Plan = lazy(() => import("@/app/Plan"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
// const Map = lazy(() => import("@/app/Map"));
const Plans = lazy(() => import("@/app/Plans"));

const router = createBrowserRouter([
  {
    element: <Layout header={false} footer={false} />,
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
        element: <Landing />,
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
    element: <Layout />,
    children: [
      {
        element: (
          <SuspenseBoundary key="about">
            <About />
          </SuspenseBoundary>
        ),
        path: "about",
      },
    ],
  },
  {
    element: <Layout />,
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
        ],
      },
    ],
  },
  {
    element: <Layout footer={false} />,
    children: [
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
          <SuspenseBoundary key="courses/:subject/:number">
            <Course.Root />
          </SuspenseBoundary>
        ),
        path: "courses/:subject/:number",
        children: [
          {
            element: (
              <SuspenseBoundary key="overview">
                <Course.Overview />
              </SuspenseBoundary>
            ),
            index: true,
          },
          {
            element: (
              <SuspenseBoundary key="classes">
                <Course.Classes />
              </SuspenseBoundary>
            ),
            path: "classes",
          },
          {
            element: (
              <SuspenseBoundary key="enrollment">
                <Course.Enrollment />
              </SuspenseBoundary>
            ),
            path: "enrollment",
          },
          {
            element: (
              <SuspenseBoundary key="grades">
                <Course.Grades />
              </SuspenseBoundary>
            ),
            path: "grades",
          },
          {
            path: "*",
            loader: ({ params: { subject, number } }) =>
              redirect(`/courses/${subject}/${number}`),
          },
        ],
      },
      {
        element: (
          <SuspenseBoundary key="catalog/:year?/:semester?/:subject?/:courseNumber?/:number?">
            <Catalog />
          </SuspenseBoundary>
        ),
        path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:number?",
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
            element: <Class.Ratings />,
            path: "ratings",
          },
          {
            path: "*",
            loader: ({ params: { year, semester, subject, courseNumber } }) =>
              redirect(
                `/catalog/${year}/${semester}/${subject}/${courseNumber}`
              ),
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
      {
        element: (
          <SuspenseBoundary key="plans">
            <Plans />
          </SuspenseBoundary>
        ),
        path: "plans",
      },
      {
        element: (
          <SuspenseBoundary key="plans/:planId">
            <Plan />
          </SuspenseBoundary>
        ),
        path: "plans/:planId",
      },
    ],
  },
  {
    path: "*",
    loader: () => redirect("/"),
  },
]);

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
  }),
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        {/* <PinsProvider> */}
        <RouterProvider router={router} />
        {/* </PinsProvider> */}
      </ThemeProvider>
    </ApolloProvider>
  );
}
