import { createRoot } from "react-dom/client";
import { AppRouterProvider } from "./app/provider/AppRouterProvider";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <>
    <AppRouterProvider />
  </>
);
