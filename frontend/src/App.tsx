import { lazy } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Catalog from "@/app/Catalog";
import Landing from "@/app/Landing";
import BaseLayout from "@/components/BaseLayout";
import Layout from "@/components/Layout";

const About = lazy(() => import("@/app/About"));
const Enrollment = lazy(() => import("@/app/Catalog/Class/Enrollment"));
const Grades = lazy(() => import("@/app/Catalog/Class/Grades"));
const Overview = lazy(() => import("@/app/Catalog/Class/Overview"));
const Sections = lazy(() => import("@/app/Catalog/Class/Sections"));
const Discover = lazy(() => import("@/app/Discover"));
const Plan = lazy(() => import("@/app/Plan"));
const Schedule = lazy(() => import("@/app/Schedule"));
const Compare = lazy(() => import("@/app/Schedule/Compare"));
const Manage = lazy(() => import("@/app/Schedule/Manage"));
const Schedules = lazy(() => import("@/app/Schedules"));
const Map = lazy(() => import("@/app/Map"));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        element: <BaseLayout header={false} footer={false} />,
        children: [
          {
            element: <Landing />,
            index: true,
          },
          {
            element: <Discover />,
            path: "explore",
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
                path: "compare/:comparedScheduleId?",
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
        element: <BaseLayout />,
        children: [
          {
            element: <About />,
            path: "about",
          },
        ],
      },
      {
        element: <BaseLayout footer={false} />,
        children: [
          {
            element: <Catalog />,
            path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:classNumber?",
            children: [
              {
                element: <Overview />,
                index: true,
              },
              {
                element: <Sections />,
                path: "sections",
              },
              {
                element: <Enrollment />,
                path: "enrollment",
              },
              {
                element: <Grades />,
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
    ],
  },
]);

export default function App() {
  return (
    <IconoirProvider
      iconProps={{
        strokeWidth: 2,
        width: 16,
        height: 16,
      }}
    >
      <Tooltip.Provider delayDuration={0}>
        <RouterProvider router={router} />
      </Tooltip.Provider>
    </IconoirProvider>
  );
}
