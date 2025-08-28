import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../../pages/landing/LandingPage";
import LoginPage from "../../pages/login/LoginPage";
import RootLayout from "../layout/RootLayout";
import GreetingPage from "../../pages/greeting/GreetingPage";
import CreateClubPage from "@/pages/createclub/CreateClubPage";
import VerifyCodePage from "@/pages/verifycode/VerifyCodePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/greeting",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <GreetingPage />,
      },
    ],
  },
  {
    path: "/createclub",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <CreateClubPage />,
      },
    ],
  },
  {
    path: "/verifycode",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <VerifyCodePage />,
      },
    ],
  },
]);

export default router;
