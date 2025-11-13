import { useState } from "react";
import SwitchTab from "../components/SwitchTab";
import Pagination from "../components/Pagination";

export type MailVariant = "interview" | "final";

type RecruitDetailMainHeaderProps = {
  activeTab: "서류 심사" | "면접";
  onTabChange: (tab: "서류 심사" | "면접") => void;
  documentCount: number;
  interviewCount: number;
  documentMailReady: boolean;
  finalMailReady: boolean;
  isSendingMail: boolean;
  onSendMail: (variant: MailVariant) => void;
};

const RecruitDetailMainHeader = ({
  activeTab,
  onTabChange,
  documentCount,
  interviewCount,
  documentMailReady,
  finalMailReady,
  isSendingMail,
  onSendMail,
}: RecruitDetailMainHeaderProps) => {
  const tabs = [
    { name: "서류 심사", count: documentCount },
    { name: "면접", count: interviewCount },
  ];

  const isDocumentTab = activeTab === "서류 심사";
  const buttonLabel = isDocumentTab
    ? "지원자 면접 메일 발송"
    : "최종 합불 메일 전송";
  const isButtonDisabled = isDocumentTab ? !documentMailReady : !finalMailReady;
  const isDisabled = isButtonDisabled || isSendingMail;
  const buttonText = isSendingMail ? "발송 중..." : buttonLabel;
  const [pendingVariant, setPendingVariant] = useState<MailVariant | null>(
    null
  );

  const handleButtonClick = () => {
    if (isDisabled) {
      return;
    }
    setPendingVariant(isDocumentTab ? "interview" : "final");
  };

  const handleCloseModal = () => {
    if (isSendingMail) return;
    setPendingVariant(null);
  };

  const handleConfirmModal = () => {
    if (!pendingVariant || isSendingMail) return;
    onSendMail(pendingVariant);
    setPendingVariant(null);
  };

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

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isDisabled}
        className="self-end rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonText}
      </button>

      {pendingVariant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-gray-900">
                정말 메일을 발송하시겠습니까?
              </p>
              <p className="text-sm text-gray-600">
                발송을 시작하면 즉시 처리되며 취소할 수 없습니다.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSendingMail}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmModal}
                disabled={isSendingMail}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitDetailMainHeader;
