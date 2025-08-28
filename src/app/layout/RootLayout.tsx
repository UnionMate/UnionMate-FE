import { Outlet } from "react-router-dom";
import { Toaster } from "../../components/ui/sonner";
import Header from "../../shared/components/Header";

const RootLayout = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <Header />
      <Outlet />
      <Toaster />
    </div>
  );
};

export default RootLayout;
