import { IconoirProvider } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Catalog from "@/app/Catalog";
import Landing from "@/app/Landing";
import Layout from "@/app/Layout";

const router = createBrowserRouter([
  {
    element: <Layout header={false} />,
    children: [
      {
        element: <Landing />,
        path: "/",
      },
    ],
  },
  {
    element: <Layout />,
  },
  {
    element: <Layout footer={false} />,
    children: [
      {
        element: <Catalog />,
        path: "/catalog",
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
      <RouterProvider router={router} />
    </IconoirProvider>
  );
}
