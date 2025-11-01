import { useEffect, useState } from "react";
import DetailMainCard from "@/widget/recruitdetail/components/DetailMainCard";
import {
  REVIEWER_DISPLAY_NAME,
  makeMemoId,
  statusLabelMap,
  statusToneMap,
} from "@/widget/recruitdetail/constants/applicants";
import type {
  ApplicantDetail,
  ApplicantMemo,
  ApplicantStatus,
} from "@/widget/recruitdetail/types";

interface RecruitApplicantMainProps {
  initialApplicant: ApplicantDetail | null;
}

const RecruitApplicantMain = ({
  initialApplicant,
}: RecruitApplicantMainProps) => {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(
    initialApplicant
  );

  useEffect(() => {
    setApplicant(initialApplicant);
  }, [initialApplicant]);

  const handleAddMemo = (applicantId: string, content: string) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }

      const newMemo: ApplicantMemo = {
        id: makeMemoId(),
        author: REVIEWER_DISPLAY_NAME,
        content,
        isMine: true,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        memos: [newMemo, ...prev.memos],
      };
    });
  };

  const handleUpdateMemo = (
    applicantId: string,
    memoId: string,
    content: string
  ) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }

      return {
        ...prev,
        memos: prev.memos.map((memo) =>
          memo.id === memoId
            ? {
                ...memo,
                content,
                createdAt: new Date().toISOString(),
              }
            : memo
        ),
      };
    });
  };

  const handleDeleteMemo = (applicantId: string, memoId: string) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }

      return {
        ...prev,
        memos: prev.memos.filter((memo) => memo.id !== memoId),
      };
    });
  };

  const handleStatusChange = (applicantId: string, status: ApplicantStatus) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }

      return {
        ...prev,
        status,
      };
    });
  };

  if (!applicant) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
        선택한 지원자를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-shrink-0 items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {applicant.name}
          </p>
          <p className="text-sm text-gray-500">{applicant.appliedTrack}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1 text-sm font-semibold ${
            statusToneMap[applicant.status]
          }`}
        >
          {statusLabelMap[applicant.status]}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DetailMainCard
          applicant={applicant}
          onAddMemo={handleAddMemo}
          onUpdateMemo={handleUpdateMemo}
          onDeleteMemo={handleDeleteMemo}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default RecruitApplicantMain;
