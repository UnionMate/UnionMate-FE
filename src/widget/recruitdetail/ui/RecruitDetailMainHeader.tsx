import { useState } from "react";
import SwitchTab from "../components/SwitchTab";
import Pagination from "../components/Pagination";
import SwitchState from "../components/SwitchState";
import MailButton from "../components/MailButton";

const RecruitDetailMainHeader = () => {
  const [activeTab, setActiveTab] = useState("서류 심사");
  const [activeStep, setActiveStep] = useState("evaluation");

  const tabs = [
    { name: "서류 심사", count: 25 },
    { name: "면접", count: 0 },
  ];

  const steps = [
    { key: "evaluation", label: "지원자 평가" },
    { key: "mail", label: "합-불 메일 전송" },
    { key: "pass", label: "합격자 이동" },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleStepChange = (stepKey: string) => {
    setActiveStep(stepKey);
  };

  const actionVariant: "evaluation" | "mail" | "pass" =
    activeStep === "evaluation"
      ? "evaluation"
      : activeStep === "mail"
        ? "mail"
        : "pass";

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
        <SwitchState
          steps={steps}
          activeStep={activeStep}
          onStepChange={handleStepChange}
        />
        <MailButton variant={actionVariant} />
      </div>
    </div>
  );
};

export default RecruitDetailMainHeader;
