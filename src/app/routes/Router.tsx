import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../../pages/landing/LandingPage";
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
import FormUpdatePage from "@/pages/formEdit/FormUpdatePage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminRegisterPage from "@/pages/admin/register/AdminRegisterPage";
import AdminGreetingPage from "@/pages/admin/greeting/AdminGreetingPage";
import ApplicationListPage from "@/pages/applications/ApplicationListPage";
import ApplicationEditPage from "@/pages/applications/ApplicationEditPage";
import RecruitmentApplyPage from "@/pages/recruitment/RecruitmentApplyPage";
import RecruitmentThankYouPage from "@/pages/recruitment/RecruitmentThankYouPage";
import RecruitmentFinalResultPage from "@/pages/recruitment/RecruitmentFinalResultPage";

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
        element: <ApplicationListPage />,
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
    path: "/applications/update/:applicationId",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ApplicationEditPage />,
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
      {
        path: "detail/:id/applicant/:applicantId/interview",
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
  {
    path: "/:councilId/update/:recruitmentId",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <FormUpdatePage />,
      },
    ],
  },
  {
    path: "/recruitment/:recruitmentId",
    element: <RecruitmentApplyPage />,
  },
  {
    path: "/recruitment/:recruitmentId/thanks",
    element: <RecruitmentThankYouPage />,
  },
  {
    path: "/passingresult",
    element: <RecruitmentFinalResultPage />,
  },
]);

export default router;
