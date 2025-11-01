import clsx from "clsx";
import {
  ChevronLeft,
  Mail,
  Settings,
  Users,
  ChevronRight,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Users, label: "모집", path: "/recruit" },
    { icon: Mail, label: "메일 템플릿" },
    { icon: Settings, label: "동아리 관리", path: "/setting" },
  ];

  return (
    <div
      className={clsx(
        "flex h-full flex-shrink-0 flex-col bg-gray-50 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <button onClick={onToggle}>
          {isCollapsed ? (
            <ChevronRight className="w-6 h-6 text-primary" />
          ) : (
            <ChevronLeft className="w-6 h-6 text-primary" />
          )}
        </button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-black">홍길동</span>
              <span className="text-sm text-gray-500">email@gmail.com</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1 px-4">
        {menuItems.map((item, index) => {
          const isActive = item.path
            ? location.pathname.startsWith(item.path)
            : false;

          return (
            <div
              key={index}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }
              }}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-colors",
                item.path ? "cursor-pointer" : "cursor-default",
                isActive
                  ? "bg-[#80ca14] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
