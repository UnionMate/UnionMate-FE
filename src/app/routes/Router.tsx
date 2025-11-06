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
import RecruitApplicantPage from "@/pages/recruitApplicant/RecruitApplicantPage";
import SettingPage from "@/pages/setting/SettingPage";
import FormEditPageWrapper from "@/pages/formEdit/FormEditPageWrapper";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminRegisterPage from "@/pages/admin/register/AdminRegisterPage";
import AdminGreetingPage from "@/pages/admin/greeting/AdminGreetingPage";
import ApplicationListPage from "@/pages/applications/ApplicationListPage";

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
    path: "/applications",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ApplicationListPage />,
      },
    ],
  },

  {
    path: "/admin",
    element: <RootLayout />,
    children: [
      {
        path: "greeting",
        element: <AdminGreetingPage />,
      },
      {
        path: "login",
        element: <AdminLoginPage />,
      },
      {
        path: "register",
        element: <AdminRegisterPage />,
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
    path: "/:councilId/recruit",
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
      {
        path: "detail/:id/applicant/:applicantId",
        element: <RecruitApplicantPage />,
      },
    ],
  },
  {
    path: "/:councilId/setting",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <SettingPage />,
      },
    ],
  },
  {
    path: "/:councilId/applicationform/edit",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <FormEditPageWrapper />,
      },
    ],
  },
]);

export default router;
