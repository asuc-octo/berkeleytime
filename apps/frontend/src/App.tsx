import { lazy } from "react";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Landing from "@/app/Landing";
import Layout from "@/components/Layout";
import PinsProvider from "@/components/PinsProvider";

// TODO: Experiment with server-side rendering for static pages and hydration for dynamic pages

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

const Catalog = lazy(() => import("@/app/Catalog"));
const Enrollment = lazy(() => import("@/app/Enrollment"));
const Grades = lazy(() => import("@/app/Grades"));
const About = lazy(() => import("@/app/About"));
const Discover = lazy(() => import("@/app/Discover"));
const Plan = lazy(() => import("@/app/Plan"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Comparison"));
const Manage = lazy(() => import("@/app/Schedule/Editor"));
const Schedules = lazy(() => import("@/app/Schedules"));
const Map = lazy(() => import("@/app/Map"));
const Plans = lazy(() => import("@/app/Plans"));

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
          {
            path: "*",
            loader: () => redirect("."),
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
          {
            path: "*",
            loader: () => redirect("."),
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
          {
            path: "*",
            loader: () => redirect("."),
          },
        ],
      },
      {
        element: <Schedules />,
        path: "schedules",
      },
      {
        element: <Plans />,
        path: "plans",
      },
      {
        element: <Plan />,
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
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <PinsProvider>
          <RouterProvider router={router} />
        </PinsProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
