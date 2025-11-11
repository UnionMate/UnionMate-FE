import { useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { MailOpen } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { decodeJWT } from "@/lib/utils";
import {
  useGetCouncilMembers,
  delegateCouncilPresident,
  removeCouncilMember,
  type CouncilMember,
} from "@/api/getCouncilMembers";
import {
  getCouncilInvitationCode,
  refreshCouncilInvitationCode,
} from "@/api/councilInvitationCode";

type TabKey = "admins" | "invite";

interface AdminInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  rawRole: CouncilMember["councilRole"];
}

const mapRole = (councilRole: CouncilMember["councilRole"]): string =>
  councilRole === "VICE" ? "회장" : "관리자";

const SettingMain = () => {
  const { councilId } = useParams<{ councilId: string }>();
  const parsedCouncilId = councilId ? Number(councilId) : NaN;
  const hasValidCouncilId = Number.isFinite(parsedCouncilId);
  const [activeTab, setActiveTab] = useState<TabKey>("admins");
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isEditingInviteCode, setIsEditingInviteCode] = useState(false);
  const [delegateTarget, setDelegateTarget] = useState<AdminInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInfo | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[] | null>(
    null
  );
  const displayInviteCode = isEditingInviteCode ? inviteInput : inviteCode;
  const inviteMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const {
    data: membersData,
    isLoading,
    refetch: refetchMembers,
  } = useGetCouncilMembers(councilId);
  const currentManagerId = useMemo(() => getCurrentManagerId(), []);

  const admins: AdminInfo[] = useMemo(() => {
    if (!membersData?.data) return [];
    return membersData.data.map((member) => ({
      id: member.councilManagerId,
      name: member.memberName,
      email: member.memberEmail,
      role: mapRole(member.councilRole),
      rawRole: member.councilRole,
    }));
  }, [membersData]);
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const allSelected = useMemo(() => {
    const selectableAdmins = admins.filter(
      (admin) => admin.rawRole !== "VICE" && admin.id !== currentManagerId
    );
    return (
      selectableAdmins.length > 0 &&
      selectedAdminIds.length === selectableAdmins.length
    );
  }, [admins, selectedAdminIds.length, currentManagerId]);

  useEffect(() => {
    if (!masterCheckboxRef.current) return;
    const selectableAdmins = admins.filter(
      (admin) => admin.rawRole !== "VICE" && admin.id !== currentManagerId
    );
    masterCheckboxRef.current.indeterminate =
      selectedAdminIds.length > 0 &&
      selectedAdminIds.length < selectableAdmins.length;
  }, [admins, selectedAdminIds.length, currentManagerId]);

  const showInviteMessage = (message: string) => {
    setInviteMessage(message);
    if (inviteMessageTimeoutRef.current) {
      clearTimeout(inviteMessageTimeoutRef.current);
    }
    inviteMessageTimeoutRef.current = setTimeout(() => {
      setInviteMessage("");
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (inviteMessageTimeoutRef.current) {
        clearTimeout(inviteMessageTimeoutRef.current);
      }
    };
  }, []);

  const {
    data: inviteCodeResponse,
    isLoading: isInviteLoading,
    refetch: refetchInviteCode,
  } = useQuery({
    queryKey: ["council-invite-code", parsedCouncilId],
    queryFn: () => getCouncilInvitationCode(parsedCouncilId),
    enabled: hasValidCouncilId,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const fetchedCode = inviteCodeResponse?.data?.invitationCode;
    if (
      typeof fetchedCode === "string" &&
      fetchedCode.trim().length > 0 &&
      !isEditingInviteCode
    ) {
      setInviteCode(fetchedCode);
      setInviteInput(fetchedCode);
    }
  }, [inviteCodeResponse?.data?.invitationCode, isEditingInviteCode]);

  const { mutate: regenerateInviteCode, isPending: isRefreshingInvite } =
    useMutation({
      mutationFn: async (nextCodeValue: string) => {
        if (!hasValidCouncilId) {
          throw new Error("학생회 정보를 확인할 수 없습니다.");
        }
        const response = await refreshCouncilInvitationCode(parsedCouncilId, {
          invitationCode: nextCodeValue,
        });
        return response;
      },
      onSuccess: async (response, requestedCode) => {
        let nextCode = response.data?.invitationCode?.trim();
        if (!nextCode) {
          const refreshed = await refetchInviteCode();
          nextCode = refreshed.data?.data?.invitationCode?.trim() ?? "";
        }
        const appliedCode =
          nextCode && nextCode.length > 0 ? nextCode : requestedCode;
        setInviteCode(appliedCode);
        setInviteInput(appliedCode);
        setIsEditingInviteCode(false);
        showInviteMessage(`새 초대 코드가 저장되었습니다: ${appliedCode}`);
        refetchInviteCode();
      },
      onError: () => {
        showInviteMessage("초대 코드 갱신에 실패했습니다. 다시 시도해주세요.");
      },
    });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdminIds(
        admins
          .filter(
            (admin) => admin.rawRole !== "VICE" && admin.id !== currentManagerId
          )
          .map((admin) => admin.id)
      );
    } else {
      setSelectedAdminIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin || admin.rawRole === "VICE" || admin.id === currentManagerId)
      return;

    setSelectedAdminIds((prev) =>
      prev.includes(id)
        ? prev.filter((adminId) => adminId !== id)
        : [...prev, id]
    );
  };

  const { mutate: delegatePresident, isPending: isDelegating } = useMutation({
    mutationFn: (managerId: number) => delegateCouncilPresident(managerId),
    onSuccess: () => {
      toast.success("회장을 위임했습니다.");
      setDelegateTarget(null);
      refetchMembers();
    },
    onError: (error) => {
      const message =
        getApiErrorMessage(error) ||
        "회장 위임에 실패했습니다. 다시 시도해주세요.";
      if (isForbiddenError(error)) {
        toast.error("회장 위임 권한이 없습니다.");
        return;
      }
      const display =
        message.includes("회장 권한이 없습니다") || message.includes("권한")
          ? "회장 위임 권한이 없습니다."
          : message;
      toast.error(display);
    },
  });

  const { mutate: deleteMembers, isPending: isDeletingMembers } = useMutation({
    mutationFn: async (targets: number | number[]) => {
      const ids = Array.isArray(targets) ? targets : [targets];
      await Promise.all(ids.map((id) => removeCouncilMember(id)));
      return ids;
    },
    onSuccess: (_, targets) => {
      const ids = (Array.isArray(targets) ? targets : [targets]).map(Number);
      setSelectedAdminIds((prev) =>
        prev.filter((adminId) => !ids.includes(adminId))
      );
      toast.success("멤버가 삭제되었습니다.");
      setDeleteTarget(null);
      setPendingDeleteIds(null);
      refetchMembers();
    },
    onError: (error) => {
      const message =
        getApiErrorMessage(error) ||
        "멤버 삭제에 실패했습니다. 다시 시도해주세요.";
      if (isForbiddenError(error)) {
        toast.error("해당 작업을 수행할 권한이 없습니다.");
        return;
      }
      const display =
        message.includes("권한") || message.includes("권한이 없습니다")
          ? "해당 작업을 수행할 권한이 없습니다."
          : message;
      toast.error(display);
    },
  });

  const handleDelegate = (admin: AdminInfo) => {
    if (admin.id === currentManagerId) {
      toast.error("내 계정에는 회장을 위임할 수 없습니다.");
      return;
    }
    setDelegateTarget(admin);
  };

  const handleDeleteSelected = () => {
    if (selectedAdminIds.length === 0 || isDeletingMembers) return;
    setPendingDeleteIds([...selectedAdminIds]);
    setDeleteTarget(null);
  };

  const handleDeleteSingle = (admin: AdminInfo) => {
    if (isDeletingMembers) return;
    if (admin.id === currentManagerId) {
      toast.error("내 계정은 삭제할 수 없습니다.");
      return;
    }
    setDeleteTarget(admin);
    setPendingDeleteIds([admin.id]);
  };

  const confirmDelegate = () => {
    if (!delegateTarget) return;
    delegatePresident(delegateTarget.id);
  };

  const cancelDelegate = () => {
    setDelegateTarget(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteIds || pendingDeleteIds.length === 0) return;
    deleteMembers(pendingDeleteIds);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setPendingDeleteIds(null);
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      showInviteMessage("저장된 초대 코드가 없습니다. 먼저 생성해주세요.");
      return;
    }
    if (typeof navigator === "undefined") return;
    try {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(inviteCode);
        showInviteMessage("초대 코드가 복사되었어요.");
      } else {
        showInviteMessage("복사를 지원하지 않는 환경이에요.");
      }
    } catch (error) {
      console.error(error);
      showInviteMessage("코드 복사에 실패했어요. 다시 시도해주세요.");
    }
  };

  const handleStartInviteEdit = () => {
    if (isInviteLoading || isRefreshingInvite) {
      return;
    }
    setInviteInput(inviteCode);
    setIsEditingInviteCode(true);
  };

  const handleCancelInviteEdit = () => {
    setInviteInput(inviteCode);
    setIsEditingInviteCode(false);
    showInviteMessage("초대 코드 수정을 취소했습니다.");
  };

  const handleSaveInviteCode = () => {
    const nextCode = inviteInput.trim();
    if (!nextCode) {
      showInviteMessage("초대 코드를 입력한 뒤 저장해주세요.");
      return;
    }
    if (!hasValidCouncilId) {
      showInviteMessage("학생회 정보를 확인할 수 없습니다.");
      return;
    }
    if (nextCode === inviteCode) {
      showInviteMessage("변경된 내용이 없습니다.");
      return;
    }
    regenerateInviteCode(nextCode);
  };

  const selectedCount = selectedAdminIds.length;

  return (
    <>
      <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("admins")}
            className={`px-6 py-4 text-15-semibold transition ${
              activeTab === "admins"
                ? "border-b-2 border-primary text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            관리자
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invite")}
            className={`px-6 py-4 text-15-semibold transition ${
              activeTab === "invite"
                ? "border-b-2 border-primary text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            관리자 초대 코드
          </button>
        </div>

        <div className="p-6 pb-8 h-full">
          {activeTab === "admins" ? (
            <div className="flex flex-col gap-4 pb-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  총 {admins.length}명 · 선택 {selectedCount}명
                </p>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={selectedCount === 0 || isDeletingMembers}
                  className="text-sm font-semibold text-red-500 transition enabled:hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  선택 삭제
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px] space-y-3">
                  <div className="grid grid-cols-[80px_minmax(0,1.4fr)_minmax(140px,1fr)_minmax(0,1.6fr)_160px] items-center gap-4 rounded-lg bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-500">
                    <span className="flex items-center text-left">
                      <input
                        ref={masterCheckboxRef}
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) =>
                          toggleSelectAll(event.target.checked)
                        }
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: "var(--primary)" }}
                      />
                    </span>
                    <span className="text-left">이름</span>
                    <span className="text-left">역할</span>
                    <span className="text-left">이메일</span>
                    <span className="text-right">작업</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                        로딩 중...
                      </div>
                    ) : admins.length === 0 ? (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                        초대된 관리자가 없습니다.
                      </div>
                    ) : (
                      admins.map((admin) => {
                        const isPresident = admin.rawRole === "VICE";
                        const isSelf = admin.id === currentManagerId;
                        const isSelected = selectedAdminIds.includes(admin.id);
                        const canActOnRow = !isPresident && !isSelf;
                        return (
                          <div
                            key={admin.id}
                            className="grid grid-cols-[80px_minmax(0,1.4fr)_minmax(140px,1fr)_minmax(0,1.6fr)_160px] items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(admin.id)}
                                disabled={
                                  isPresident ||
                                  isSelf ||
                                  isDelegating ||
                                  isDeletingMembers
                                }
                                className="h-4 w-4"
                                style={{
                                  accentColor: "var(--primary)",
                                  cursor:
                                    isPresident || isSelf
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              />
                            </div>
                            <span className="text-base font-medium text-gray-900 text-left truncate">
                              {admin.name}
                            </span>
                            <span className="text-sm font-semibold text-left text-primary">
                              {admin.role}
                            </span>
                            <span className="text-sm text-gray-500 text-left truncate">
                              {admin.email}
                            </span>
                            <div className="flex justify-end gap-2">
                              {canActOnRow ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDelegate(admin)}
                                    disabled={isDelegating}
                                    className="rounded-lg border border-primary/40 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    회장 위임
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSingle(admin)}
                                    disabled={isDeletingMembers}
                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    삭제
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {isPresident
                                    ? "회장"
                                    : isSelf
                                    ? "내 계정"
                                    : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-8">
              <div className="flex flex-col items-center justify-center gap-8 rounded-2xl bg-gray-50 px-6 py-16 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MailOpen className="h-16 w-16" strokeWidth={1.8} />
                </div>
                <div className="space-y-2">
                  <p className="text-16-semibold text-gray-900">
                    초대 코드를 학생회 인원에게 공유하여 가입시켜주세요.
                  </p>
                </div>
                <div className="flex w-full max-w-md flex-col items-center gap-4">
                  <div className="w-full rounded-2xl bg-white px-5 py-4 shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      현재 초대 코드
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {displayInviteCode
                        ? displayInviteCode
                        : isInviteLoading
                        ? "불러오는 중..."
                        : "등록된 코드가 없습니다."}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyInviteCode}
                        disabled={
                          !inviteCode || isInviteLoading || isRefreshingInvite
                        }
                        className="flex-1 rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        초대 코드 복사
                      </button>
                      {!isEditingInviteCode && (
                        <button
                          type="button"
                          onClick={handleStartInviteEdit}
                          disabled={isInviteLoading || isRefreshingInvite}
                          className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          초대 코드 수정
                        </button>
                      )}
                    </div>
                  </div>
                  {isEditingInviteCode && (
                    <div className="w-full space-y-3 rounded-2xl border border-primary/20 bg-white px-5 py-5 shadow">
                      <p className="text-sm font-semibold text-gray-900">
                        새로운 초대 코드를 입력하세요!
                      </p>
                      <input
                        value={inviteInput}
                        onChange={(event) => setInviteInput(event.target.value)}
                        placeholder="예: UM-1234-ABCD"
                        className="w-full rounded-xl border border-primary/40 px-4 py-3 text-base font-semibold text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={handleCancelInviteEdit}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:w-auto"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveInviteCode}
                          disabled={isRefreshingInvite}
                          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {isRefreshingInvite ? "저장 중..." : "저장"}
                        </button>
                      </div>
                    </div>
                  )}
                  {inviteMessage && (
                    <p
                      className="w-full text-center text-14-semibold text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      {inviteMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {delegateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {delegateTarget.name}에게 회장 권한을 위임하시겠습니까?
              </p>
              <p className="text-sm text-gray-500">
                위임 이후에는 해당 관리자가 회장 역할을 수행하게 됩니다.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelegate}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                아니요
              </button>
              <button
                type="button"
                onClick={confirmDelegate}
                disabled={isDelegating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDelegating ? "위임 중..." : "예"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteIds && pendingDeleteIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {deleteTarget?.name
                  ? `${deleteTarget.name}을(를) 학생회에서 삭제하시겠습니까?`
                  : `선택된 ${pendingDeleteIds.length}명을 학생회에서 삭제하시겠습니까?`}
              </p>
              <p className="text-sm text-gray-500">
                삭제하면 해당 관리자는 더 이상 학생회에 접근할 수 없습니다.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                아니요
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeletingMembers}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingMembers ? "삭제 중..." : "예"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingMain;

const getApiErrorMessage = (error: unknown): string | null => {
  if (!isAxiosError(error)) {
    return null;
  }
  const axiosError = error as {
    response?: {
      data?: unknown;
    };
  };
  const data = axiosError.response?.data;
  if (!data) {
    return null;
  }
  if (typeof data === "string") {
    return data;
  }
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return null;
};

const isForbiddenError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false;
  }
  const axiosError = error as {
    response?: {
      status?: number;
    };
  };
  return axiosError.response?.status === 403;
};

const getCurrentManagerId = (): number | null => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;
    if (!token) return null;
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    const rawId =
      (decoded.managerId as number | string | undefined) ??
      (decoded.councilManagerId as number | string | undefined) ??
      (decoded.sub as number | string | undefined);
    if (typeof rawId === "number" && Number.isFinite(rawId)) {
      return rawId;
    }
    if (typeof rawId === "string") {
      const numeric = Number(rawId);
      return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
  } catch {
    return null;
  }
};
