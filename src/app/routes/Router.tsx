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
import SettingPage from "@/pages/setting/SettingPage";
import FormEditPage from "@/pages/formEdit/FormEditPage";

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
  // DashboardLayout을 사용하는 공통 경로들
  {
    path: "/recruit",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <RecruitPage />,
      },
      {
        path: "detail/:id",
        element: <RecruitDetailPage />,
      },
    ],
  },
  {
    path: "/setting",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <SettingPage />,
      },
    ],
  },
  // RootLayout을 사용하는 경로
  {
    path: "/applicationform/edit",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <FormEditPage />,
      },
    ],
  },
]);

export default router;
