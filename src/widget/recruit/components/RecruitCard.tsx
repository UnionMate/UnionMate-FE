import { EllipsisVertical } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateRecruitment, deleteRecruitment } from "@/api/recruitment";
import type { RecruitCardData } from "../constants/recruitCardList";

interface RecruitCardProps {
  recruit: RecruitCardData;
}

const resolveAppOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
};

const RecruitCard = ({ recruit }: RecruitCardProps) => {
  const navigate = useNavigate();
  const { councilId } = useParams<{ councilId: string }>();
  const { id, name, isActive } = recruit;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPosted, setIsPosted] = useState(isActive);
  const [copyMessage, setCopyMessage] = useState("");
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: activateRecruit, isPending } = useMutation({
    mutationFn: () => activateRecruitment(id, { active: true }),
    onSuccess: (response) => {
      setIsPosted(response.data.active);
      setIsModalOpen(false);
      // recruitments 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
    onError: (error) => {
      console.error("모집 게시 실패:", error);
      alert("모집 게시에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const { mutate: removeRecruit, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteRecruitment(id),
    onSuccess: () => {
      setIsDropdownOpen(false);
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
    onError: (error) => {
      console.error("모집 삭제 실패:", error);
      alert("모집 삭제에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleNavigate = () => {
    if (councilId) {
      navigate(`/${councilId}/recruit/detail/${id}`);
    }
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
    activateRecruit();
  };

  const handleModalCancel = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsModalOpen(false);
  };

  const handleDropdownToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropdownOpen(false);
    if (councilId) {
      navigate(`/${councilId}/update/${id}`);
    }
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isPosted) return;
    removeRecruit();
  };

  const handleCopyLink = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const appOrigin = resolveAppOrigin();
    const link = appOrigin
      ? `${appOrigin}/recruitment/${id}`
      : `/recruitment/${id}`;

    try {
      if (navigator.clipboard && "writeText" in navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyMessage("링크가 복사되었어요.");
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (error) {
      console.error("링크 복사 실패:", error);
      setCopyMessage("복사에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setCopyMessage(""), 2500);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center relative">
            <div className="text-base font-bold text-gray-800">{name}</div>
            {!isPosted && (
              <div
                ref={dropdownRef}
                className="relative"
                onClick={stopPropagation}
              >
                <button
                  type="button"
                  onClick={handleDropdownToggle}
                  className="flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="메뉴 열기"
                >
                  <EllipsisVertical className="w-5 h-5 text-gray-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-8 z-50 w-32 rounded-lg bg-white shadow-lg border border-gray-200 py-1">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeletePending}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeletePending ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isPosted && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-fit rounded-full border border-primary/40 px-3 py-1 text-12-semibold text-primary transition hover:bg-primary/10"
              >
                링크 복사하기
              </button>
              {copyMessage && (
                <p className="text-12-medium text-primary">{copyMessage}</p>
              )}
            </div>
          )}
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
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "처리 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitCard;
