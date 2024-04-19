import * as Tooltip from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import About from "@/app/About";
import Catalog from "@/app/Catalog";
import Landing from "@/app/Landing";
import Layout from "@/app/Layout";
import Plan from "@/app/Plan";
import Schedules from "@/app/Schedules";
import Search from "@/app/Search";
import AccountProvider from "@/components/AccountProvider";

const router = createBrowserRouter([
  {
    element: <Layout header={false} footer={false} />,
    children: [
      {
        element: <Landing />,
        index: true,
      },
      {
        element: <Search />,
        path: "search",
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
      {
        element: <Plan />,
        path: "/plan",
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
