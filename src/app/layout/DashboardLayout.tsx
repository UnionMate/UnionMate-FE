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
    <div className="flex h-screen w-full min-h-0 flex-col overflow-hidden bg-white">
      <Header />
      <div className="flex min-h-0 w-full flex-1 bg-gray-100">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
        <div className="flex min-h-0 flex-1 flex-col px-8 py-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
