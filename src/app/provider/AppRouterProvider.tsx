import { RouterProvider } from "react-router";
import { router } from "../routes/Router";

export const AppRouterProvider = () => {
  return <RouterProvider router={router} />;
};
