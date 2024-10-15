import { lazy } from "react";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Catalog from "@/app/Catalog";
import Enrollment from "@/app/Enrollment";
import Grades from "@/app/Grades";
import Landing from "@/app/Landing";
import Layout from "@/components/Layout";

const Class = {
  Enrollment: lazy(() => import("@/components/Class/Enrollment")),
  Grades: lazy(() => import("@/components/Class/Grades")),
  Overview: lazy(() => import("@/components/Class/Overview")),
  Sections: lazy(() => import("@/components/Class/Sections")),
};

const Course = {
  Root: lazy(() => import("@/app/Course")),
  Enrollment: lazy(() => import("@/components/Course/Enrollment")),
  Grades: lazy(() => import("@/components/Course/Grades")),
  Overview: lazy(() => import("@/components/Course/Overview")),
  Classes: lazy(() => import("@/components/Course/Classes")),
};

const About = lazy(() => import("@/app/About"));
const Discover = lazy(() => import("@/app/Discover"));
const Plan = lazy(() => import("@/app/Plan"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
const Map = lazy(() => import("@/app/Map"));

const router = createBrowserRouter([
  {
    element: <Layout header={false} footer={false} />,
    children: [
      {
        element: <Discover />,
        path: "discover",
      },
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
        element: <Course.Root />,
        path: "courses/:subject/:number",
        children: [
          {
            element: <Course.Overview />,
            index: true,
          },
          {
            element: <Course.Classes />,
            path: "classes",
          },
          {
            element: <Course.Enrollment />,
            path: "enrollment",
          },
          {
            element: <Course.Grades />,
            path: "grades",
          },
        ],
      },
      {
        element: <Catalog />,
        path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:number?",
        children: [
          {
            element: <Class.Overview />,
            index: true,
          },
          {
            element: <Class.Sections />,
            path: "sections",
          },
          {
            element: <Class.Enrollment />,
            path: "enrollment",
          },
          {
            element: <Class.Grades />,
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
