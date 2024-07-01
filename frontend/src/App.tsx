import * as Tooltip from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import About from "@/app/About";
import Catalog from "@/app/Catalog";
import Discover from "@/app/Discover";
import Landing from "@/app/Landing";
import Map from "@/app/Map";
import Plan from "@/app/Plan";
import Schedule from "@/app/Schedule";
import Compare from "@/app/Schedule/Compare";
import Manage from "@/app/Schedule/Manage";
import Schedules from "@/app/Schedules";
import Layout from "@/components/Layout";

const router = createBrowserRouter([
  {
    element: <Layout header={false} footer={false} />,
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
        element: <Catalog />,
        path: "catalog/:year?/:semester?/:subject?/:courseNumber?/:classNumber?",
      },
      {
        element: <Schedules />,
        path: "schedules",
      },
      {
        element: <Plan />,
        path: "plan",
      },
      {
        element: <Map />,
        path: "map",
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
