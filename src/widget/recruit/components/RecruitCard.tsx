import { EllipsisVertical } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { RecruitCardData } from "../constants/recruitCardList";

interface RecruitCardProps {
  recruit: RecruitCardData;
}

const RecruitCard = ({ recruit }: RecruitCardProps) => {
  const navigate = useNavigate();
  const { id, title, description } = recruit;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPosted, setIsPosted] = useState(Boolean(recruit.isPosted));

  const handleNavigate = () => {
    navigate(`/recruit/detail/${id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleToggleRequest = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isPosted) return;
    setIsModalOpen(true);
  };

  const handleModalConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsPosted(true);
    setIsModalOpen(false);
  };

  const handleModalCancel = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="flex flex-col w-full h-full rounded-lg py-4 px-4 bg-white shadow-sm cursor-pointer transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex flex-col h-full gap-[72px]">
        {/* Top Section */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="text-base font-bold text-gray-800">{title}</div>
            <EllipsisVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>

        {/* Bottom Section */}
        <div
          className="flex justify-between items-center"
          onClick={stopPropagation}
        >
          <div className="text-sm text-gray-500">모집 게시</div>
          <button
            type="button"
            onClick={handleToggleRequest}
            className={clsx(
              "relative flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isPosted
                ? "bg-primary cursor-default"
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-pressed={isPosted}
            aria-label="모집 게시 상태 변경"
            disabled={isPosted}
          >
            <span
              className={clsx(
                "absolute left-[3px] top-[3px] block h-4.5 w-4.5 rounded-full bg-white transition-transform",
                isPosted ? "translate-x-[18px]" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`recruit-posting-title-${id}`}
            className="flex w-full max-w-[360px] flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div
                id={`recruit-posting-title-${id}`}
                className="text-lg font-semibold text-gray-900"
              >
                모집 게시
              </div>
              <div className="text-sm text-gray-600">
                한번 게시하면 수정할 수 없습니다.
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleModalCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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

export default RecruitCard;
