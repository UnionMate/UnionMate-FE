import SwitchTab from "../components/SwitchTab";
import Pagination from "../components/Pagination";

type RecruitDetailMainHeaderProps = {
  activeTab: "서류 심사" | "면접";
  onTabChange: (tab: "서류 심사" | "면접") => void;
  documentCount: number;
  interviewCount: number;
  mailReady: boolean;
  onSendMail: () => void;
};

const RecruitDetailMainHeader = ({
  activeTab,
  onTabChange,
  documentCount,
  interviewCount,
  mailReady,
  onSendMail,
}: RecruitDetailMainHeaderProps) => {
  const tabs = [
    { name: "서류 심사", count: documentCount },
    { name: "면접", count: interviewCount },
  ];

  const stepStatus = mailReady ? "mail" : "evaluation";

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center border-b border-gray-300">
        <SwitchTab
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => onTabChange(tab as "서류 심사" | "면접")}
        />
        <Pagination />
      </div>

      <div className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-6">
          <StepIndicator
            index={1}
            label="지원자 평가"
            active={stepStatus === "evaluation"}
          />
          <StepIndicator
            index={2}
            label="최종 합불 메일 전송"
            active={stepStatus === "mail"}
          />
        </div>
        <button
          type="button"
          onClick={onSendMail}
          disabled={!mailReady}
          className="rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          지원자 최종 합불 메일 발송
        </button>
      </div>
    </div>
  );
};

const StepIndicator = ({
  index,
  label,
  active,
}: {
  index: number;
  label: string;
  active: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
          active ? "bg-primary" : "bg-gray-300"
        }`}
      >
        {index}
      </span>
      <span
        className={`text-14-medium ${
          active ? "text-primary" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default RecruitDetailMainHeader;
