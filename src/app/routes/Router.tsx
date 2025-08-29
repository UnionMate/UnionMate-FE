import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../../pages/landing/LandingPage";
import LoginPage from "../../pages/login/LoginPage";
import RootLayout from "../layout/RootLayout";
import GreetingPage from "../../pages/greeting/GreetingPage";
import CreateClubPage from "@/pages/createclub/CreateClubPage";
import VerifyCodePage from "@/pages/verifycode/VerifyCodePage";
import DashboardLayout from "../layout/DashboardLayout";
import RecruitPage from "@/pages/recruit/RecruitPage";
import RecruitDetailPage from "@/pages/recruitdetail/RecruitDetailPage";

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
  {
    path: "/recruit",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <RecruitPage />,
      },
    ],
  },
  {
    path: "/recruit/detail",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <RecruitDetailPage />,
      },
    ],
  },
]);

export default router;
