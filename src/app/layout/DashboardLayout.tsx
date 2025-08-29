import Header from "@/shared/components/Header";
import Sidebar from "@/shared/components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      <Header />
      <div className="flex w-full h-screen bg-gray-100">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
        <div className="flex px-8 py-6 w-full h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
