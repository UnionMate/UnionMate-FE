import { Outlet } from "react-router-dom";
import { Toaster } from "../../components/ui/sonner";
import Header from "../../shared/components/Header";
import { FormEditProvider } from "../../widget/formEdit/context/FormEditProvider";
import { useLocation } from "react-router-dom";

const RootLayout = () => {
  const location = useLocation();
  const isFormEditPage = location.pathname === "/applicationform/edit";

  if (isFormEditPage) {
    return (
      <FormEditProvider>
        <div className="flex flex-col w-full h-screen bg-white">
          <Header />
          <Outlet />
          <Toaster />
        </div>
      </FormEditProvider>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <Header />
      <Outlet />
      <Toaster />
    </div>
  );
};

export default RootLayout;
