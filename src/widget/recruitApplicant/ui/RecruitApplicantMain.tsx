import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DetailMainCard from "@/widget/recruitdetail/components/DetailMainCard";
import {
  statusLabelMap,
  statusToneMap,
} from "@/widget/recruitdetail/constants/applicants";
import type {
  ApplicantDetail,
  ApplicantStatus,
} from "@/widget/recruitdetail/types";
import {
  createApplicationComment,
  deleteApplicationComment,
  getApplicationComments,
  updateApplicationComment,
} from "@/api/application";
import { decodeJWT } from "@/lib/utils";
import { toast } from "sonner";

type ManagerIdentity = {
  id: number | null;
  name: string | null;
};

const getCurrentManagerIdentity = (): ManagerIdentity => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;
    if (!token) {
      return { id: null, name: null };
    }
    const decoded = decodeJWT(token);
    if (!decoded) {
      return { id: null, name: null };
    }

    const rawId =
      (decoded.managerId as string | number | undefined) ??
      (decoded.councilManagerId as string | number | undefined) ??
      (decoded.sub as string | number | undefined);

    const numericId =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string"
        ? Number(rawId)
        : NaN;

    const id = Number.isFinite(numericId) ? numericId : null;
    const name =
      typeof decoded.username === "string"
        ? decoded.username
        : typeof decoded.name === "string"
        ? decoded.name
        : null;

    return { id, name };
  } catch (error) {
    console.error("Failed to resolve manager identity", error);
    return { id: null, name: null };
  }
};

const isCommentMine = (
  managerIdentity: ManagerIdentity,
  councilManagerId: number,
  councilManagerName: string
) => {
  if (managerIdentity.id !== null) {
    return managerIdentity.id === councilManagerId;
  }
  if (managerIdentity.name) {
    return managerIdentity.name === councilManagerName;
  }
  return false;
};

interface RecruitApplicantMainProps {
  initialApplicant: ApplicantDetail | null;
  applicationId: number;
}

const RecruitApplicantMain = ({
  initialApplicant,
  applicationId,
}: RecruitApplicantMainProps) => {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(
    initialApplicant
  );

  useEffect(() => {
    setApplicant(initialApplicant);
  }, [initialApplicant]);

  const queryClient = useQueryClient();
  const managerIdentity = useMemo(() => getCurrentManagerIdentity(), []);
  const isApplicationIdValid = Number.isFinite(applicationId);

  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useQuery({
    queryKey: ["application-comments", applicationId],
    queryFn: () => getApplicationComments(applicationId),
    enabled: isApplicationIdValid,
  });

  useEffect(() => {
    if (isCommentsError) {
      toast.error("평가 코멘트를 불러오지 못했습니다.");
    }
  }, [isCommentsError]);

  const comments = commentsData?.data ?? [];

  const memoList = useMemo(
    () =>
      comments.map((comment) => ({
        id: String(comment.commentId),
        author: comment.councilManagerName,
        content: comment.content,
        isMine: isCommentMine(
          managerIdentity,
          comment.councilManagerId,
          comment.councilManagerName
        ),
        createdAt: comment.updatedAt ?? comment.createdAt,
      })),
    [comments, managerIdentity]
  );

  const applicantWithMemos = useMemo(() => {
    if (!applicant) return null;
    return {
      ...applicant,
      memos: memoList,
    };
  }, [applicant, memoList]);

  const invalidateComments = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-comments", applicationId],
    });
  };

  const { mutate: addComment } = useMutation({
    mutationFn: (content: string) =>
      createApplicationComment(applicationId, { content }),
    onSuccess: () => {
      toast.success("코멘트가 추가되었습니다.");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "코멘트를 추가하지 못했습니다.";
      toast.error(message);
    },
  });

  const { mutate: editComment } = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateApplicationComment(applicationId, commentId, { content }),
    onSuccess: () => {
      toast.success("코멘트가 수정되었습니다.");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "코멘트를 수정하지 못했습니다.";
      toast.error(message);
    },
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: (commentId: number) =>
      deleteApplicationComment(applicationId, commentId),
    onSuccess: () => {
      toast.success("코멘트가 삭제되었습니다.");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "코멘트를 삭제하지 못했습니다.";
      toast.error(message);
    },
  });

  const handleAddMemo = (_applicantId: string, content: string) => {
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    addComment(content);
  };

  const handleUpdateMemo = (
    _applicantId: string,
    memoId: string,
    content: string
  ) => {
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    const numericId = Number(memoId);
    if (!Number.isFinite(numericId)) {
      toast.error("잘못된 코멘트 정보입니다.");
      return;
    }
    editComment({ commentId: numericId, content });
  };

  const handleDeleteMemo = (_applicantId: string, memoId: string) => {
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    const numericId = Number(memoId);
    if (!Number.isFinite(numericId)) {
      toast.error("잘못된 코멘트 정보입니다.");
      return;
    }
    removeComment(numericId);
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

  const handleInterviewUpdate = (
    applicantId: string,
    interview: ApplicantDetail["interview"]
  ) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }
      return {
        ...prev,
        interview,
      };
    });
  };

  if (!applicantWithMemos) {
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
            {applicantWithMemos.name}
          </p>
          <p className="text-sm text-gray-500">
            {applicantWithMemos.appliedTrack}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-1 text-sm font-semibold ${
            statusToneMap[applicantWithMemos.status]
          }`}
        >
          {statusLabelMap[applicantWithMemos.status]}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DetailMainCard
          applicant={applicantWithMemos}
          onAddMemo={handleAddMemo}
          onUpdateMemo={handleUpdateMemo}
          onDeleteMemo={handleDeleteMemo}
          onStatusChange={handleStatusChange}
          onInterviewUpdate={handleInterviewUpdate}
          isMemoLoading={isCommentsLoading}
        />
      </div>
    </div>
  );
};

export default RecruitApplicantMain;
