import * as Tooltip from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import About from "@/app/About";
import Catalog from "@/app/Catalog";
import Landing from "@/app/Landing";
import Layout from "@/app/Layout";
import Schedules from "@/app/Schedules";
import AccountProvider from "@/components/AccountProvider";

const router = createBrowserRouter([
  {
    element: <Layout header={false} footer={false} />,
    children: [
      {
        element: <Landing />,
        path: "/",
      },
    ],
  },
  {
    element: <Layout />,
    children: [
      {
        element: <About />,
        path: "/about",
      },
    ],
  },
  {
    element: <Layout footer={false} />,
    children: [
      {
        element: <Catalog />,
        path: "/catalog/:year?/:semester?/:subject?/:courseNumber?/:classNumber?",
      },
      {
        element: <Schedules />,
        path: "/schedules",
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
