// Import necessary dependencies from React and React DOM
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider, Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx'
import Signin from "./pages/Signin.jsx";
import Signup from "./pages/Signup.jsx";
import Ticket from "./pages/Ticket.jsx";
import Profile from "./pages/Profile.jsx";
import './index.css'

// Create routes using React Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/profile",
    element: <Profile/>,
  },
  {
    path: "/ticket",
    element: <Ticket/>,
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup/>,
  }
]);

// Render the entire application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <Routes>
        {router}
      </Routes>
    </RouterProvider>
  </React.StrictMode>
);