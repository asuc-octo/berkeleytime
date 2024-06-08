import * as Tooltip from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import About from "@/app/About";
import Catalog from "@/app/Catalog";
import Explore from "@/app/Explore";
import Landing from "@/app/Landing";
import Plan from "@/app/Plan";
import Schedule from "@/app/Schedule";
import Schedules from "@/app/Schedules";
import Compare from "@/app/Schedules/Compare";
import AccountProvider from "@/components/AccountProvider";
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
        element: <Explore />,
        path: "explore",
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
    element: <Layout footer={false} header={false} />,
    children: [
      {
        element: <Schedule />,
        path: "schedules/:scheduleId",
      },
      {
        element: <Compare />,
        path: "schedules/compare/:leftScheduleId?/:rightScheduleId?",
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
      <AccountProvider>
        <Tooltip.Provider delayDuration={0}>
          <RouterProvider router={router} />
        </Tooltip.Provider>
      </AccountProvider>
    </IconoirProvider>
  );
}
