import { lazy } from "react";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Catalog from "@/app/Catalog";
import Enrollment from "@/app/Enrollment";
import Grades from "@/app/Grades";
import Landing from "@/app/Landing";
import Layout from "@/components/Layout";

const About = lazy(() => import("@/app/About"));
const CatalogEnrollment = lazy(() => import("@/components/Class/Enrollment"));
const CatalogGrades = lazy(() => import("@/components/Class/Grades"));
const CatalogOverview = lazy(() => import("@/components/Class/Overview"));
const CatalogSections = lazy(() => import("@/components/Class/Sections"));
const Discover = lazy(() => import("@/app/Discover"));
const Plan = lazy(() => import("@/app/Plan"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
const Map = lazy(() => import("@/app/Map"));

const router = createBrowserRouter([
  {
    element: <Layout header={false} />,
    children: [
      {
        element: <Discover />,
        path: "discover",
      },
    ],
  },
  {
    element: <Layout header={false} footer={false} />,
    children: [
      {
        element: <Landing />,
        index: true,
      },
      {
        element: <Schedule />,
        path: "schedules/:scheduleId",
        children: [
          {
            element: <Manage />,
            index: true,
          },
          {
            element: <Compare />,
            path: "compare/:comparisonId?",
          },
        ],
      },
      {
        element: <Map />,
        path: "map",
      },
    ],
  },
  {
    element: <Layout />,
    children: [
      {
        element: <About />,
        path: "about",
      },
    ],
  },
  {
    element: <Layout footer={false} />,
    children: [
      {
        element: <Grades />,
        path: "grades",
      },
      {
        element: <Enrollment />,
        path: "enrollment",
      },
      {
        element: <Catalog />,
        path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:classNumber?",
        children: [
          {
            element: <CatalogOverview />,
            index: true,
          },
          {
            element: <CatalogSections />,
            path: "sections",
          },
          {
            element: <CatalogEnrollment />,
            path: "enrollment",
          },
          {
            element: <CatalogGrades />,
            path: "grades",
          },
        ],
      },
      {
        element: <Schedules />,
        path: "schedules",
      },
      {
        element: <Plan />,
        path: "plan",
      },
    ],
  },
]);

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  );
}
