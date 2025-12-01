import { lazy } from "react";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Layout from "@/components/Layout";
import SuspenseBoundary from "@/components/SuspenseBoundary";
// import CollectionProvider from "@/providers/CollectionProvider";
import UserProvider from "@/providers/UserProvider";

const Landing = lazy(() => import("@/app/Landing"));
const Profile = {
  Root: lazy(() => import("@/app/Profile")),
  Account: lazy(() => import("@/app/Profile/Account")),
  Support: lazy(() => import("@/app/Profile/Support")),
  Ratings: lazy(() => import("@/app/Profile/Ratings")),
  Settings: lazy(() => import("@/app/Profile/Settings")),
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
const CuratedClasses = lazy(() => import("@/app/CuratedClasses"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
// const Map = lazy(() => import("@/app/Map"));
const GradTrak = lazy(() => import("@/app/GradTrak"));
const GradTrakOnboarding = lazy(() => import("@/app/GradTrak/Onboarding"));
const GradTrakDashboard = lazy(() => import("@/app/GradTrak/Dashboard"));

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
    element: <Layout footer={false} />,
    children: [
      {
        path: "gradtrak",
        element: (
          <SuspenseBoundary key="gradtrak-landing">
            <GradTrak />
          </SuspenseBoundary>
        ),
      },
      {
        path: "gradtrak/onboarding",
        element: (
          <SuspenseBoundary key="gradtrak-onboarding">
            <GradTrakOnboarding />
          </SuspenseBoundary>
        ),
      },
      {
        path: "gradtrak/dashboard",
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
              <SuspenseBoundary key="settings">
                <Profile.Settings />
              </SuspenseBoundary>
            ),
            path: "settings",
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
            element: (
              <SuspenseBoundary key="ratings">
                <Class.Ratings />
              </SuspenseBoundary>
            ),
            path: "ratings",
          },
          {
            path: "*",
            loader: ({
              params: { year, semester, subject, courseNumber, number },
            }) => {
              const basePath = `/catalog/${year}/${semester}/${subject}/${courseNumber}`;
              return redirect(number ? `${basePath}/${number}` : basePath);
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
    path: "*",
    loader: () => redirect("/"),
  },
]);

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache({
    typePolicies: {
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
        {/*<CollectionProvider>*/}
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
        {/*</CollectionProvider>*/}
      </UserProvider>
    </ApolloProvider>
  );
}
