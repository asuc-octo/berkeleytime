import { IconoirProvider } from "iconoir-react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import About from "@/app/About";
import Catalog from "@/app/Catalog";
import Landing from "@/app/Landing";
import Layout from "@/app/Layout";
import Resources from "@/app/Resources";

const router = createBrowserRouter([
  {
    path: "/catalog/:semester?/:subject?/:courseNumber?",
    loader: ({
      params: { year, semester, subject, courseNumber, classNumber },
    }) => {
      let path = "/courses";
      if (year) path += `/${year}`;
      if (semester) path += `/${semester}`;
      if (subject) path += `/${subject}`;
      if (courseNumber) path += `/${courseNumber}`;
      if (classNumber) path += `/${classNumber}`;
      return redirect(path);
    },
  },
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
      {
        element: <Resources />,
        path: "/resources",
      },
    ],
  },
  {
    element: <Layout footer={false} />,
    children: [
      {
        element: <Catalog />,
        path: "/courses/:year?/:semester?/:subject?/:courseNumber?/:classNumber?",
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
