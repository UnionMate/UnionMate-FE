import { useState } from "react";
import SwitchTab from "../components/SwitchTab";
import Pagination from "../components/Pagination";
import SwitchState from "../components/SwitchState";
import MailButton from "../components/MailButton";

const RecruitDetailMainHeader = () => {
  const [activeTab, setActiveTab] = useState("서류 심사");

  const tabs = [
    { name: "서류 심사", count: 25 },
    { name: "면접", count: 0 },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Tabs and Pagination */}
      <div className="flex justify-between items-center border-b border-gray-300">
        {/* Tabs */}
        <SwitchTab
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Pagination */}
        <Pagination />
      </div>

      <div className="flex w-full justify-between">
        <SwitchState />
        <MailButton />
      </div>
    </div>
  );
};

export default RecruitDetailMainHeader;
