import React from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/errorPage";
import Chats from "./pages/chats";
import HomePage from "./pages/HomePage";
import CheckAuth from "./utils/checkAuth";
import CheckGuest from "./utils/checkGuest";

const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <CheckGuest>
            <HomePage />
          </CheckGuest>
        ),
      },
      {
        path: "/chats",
        element: (
          <CheckAuth>
            <Chats />
          </CheckAuth>
        ),
      },
    ],
  },
]);

export default router;
