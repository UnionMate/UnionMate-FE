import { useState } from "react";
import SwitchTab from "../components/SwitchTab";
import Pagination from "../components/Pagination";

const RecruitDetailMain = () => {
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
        <div className="flex gap-6">
          <div className="flex gap-2.5">
            <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
              1
            </div>
            <div className="flex text-14-medium text-gray-500">지원자 평가</div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
              2
            </div>
            <div className="flex text-14-medium text-gray-500">
              합-불 메일 전송
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
              3
            </div>
            <div className="flex text-14-medium text-gray-500">합격자 이동</div>
          </div>
        </div>

        <div className="flex gap-1.5">
          <div className="flex justify-center items-center w-[111px] h-[26px] rounded-sm py-[5px] px-[20px] bg-primary">
            <div className="flex text-[13px] font-semibold text-white">
              메일 예약하기
            </div>
          </div>

          <div className="flex justify-center items-center w-[111px] h-[26px] rounded-sm py-[5px] px-[20px] bg-primary">
            <div className="flex text-[13px] font-semibold text-white">
              메일 전송하기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitDetailMain;
