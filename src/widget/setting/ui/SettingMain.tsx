import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Copy, MailOpen, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGetCouncilMembers } from "@/api/getCouncilMembers";
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
}

const mapRole = (councilRole: "VICE" | "MANAGER"): string => {
  return councilRole === "VICE" ? "소유자" : "관리자";
};

const generateInviteCode = () =>
  `UM-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

const SettingMain = () => {
  const { councilId } = useParams<{ councilId: string }>();
  const parsedCouncilId = councilId ? Number(councilId) : NaN;
  const hasValidCouncilId = Number.isFinite(parsedCouncilId);
  const [activeTab, setActiveTab] = useState<TabKey>("admins");
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [inviteCode, setInviteCode] = useState(generateInviteCode());
  const [inviteMessage, setInviteMessage] = useState("");
  const inviteMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { data: membersData, isLoading } = useGetCouncilMembers(councilId);

  const admins: AdminInfo[] = useMemo(() => {
    if (!membersData?.data) return [];
    return membersData.data.map((member) => ({
      id: member.councilManagerId,
      name: member.memberName,
      email: member.memberEmail,
      role: mapRole(member.councilRole),
    }));
  }, [membersData]);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const allSelected = useMemo(() => {
    const selectableAdmins = admins.filter((admin) => admin.role !== "소유자");
    return (
      selectableAdmins.length > 0 &&
      selectedAdminIds.length === selectableAdmins.length
    );
  }, [admins, selectedAdminIds.length]);

  useEffect(() => {
    if (!masterCheckboxRef.current) return;
    const selectableAdmins = admins.filter((admin) => admin.role !== "소유자");
    masterCheckboxRef.current.indeterminate =
      selectedAdminIds.length > 0 &&
      selectedAdminIds.length < selectableAdmins.length;
  }, [admins, selectedAdminIds.length]);

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
    if (typeof fetchedCode === "string" && fetchedCode.trim().length > 0) {
      setInviteCode(fetchedCode);
    }
  }, [inviteCodeResponse?.data?.invitationCode]);

  const {
    mutate: regenerateInviteCode,
    isPending: isRefreshingInvite,
  } = useMutation({
    mutationFn: (currentCode: string) =>
      refreshCouncilInvitationCode(parsedCouncilId, {
        invitationCode: currentCode,
      }),
    onSuccess: (response) => {
      const nextCode = response.data?.invitationCode;
      if (nextCode) {
        setInviteCode(nextCode);
      }
      showInviteMessage("새 초대 코드가 발급되었어요.");
      refetchInviteCode();
    },
    onError: () => {
      showInviteMessage("초대 코드 갱신에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // 소유자를 제외한 관리자만 선택
      setSelectedAdminIds(
        admins
          .filter((admin) => admin.role !== "소유자")
          .map((admin) => admin.id)
      );
    } else {
      setSelectedAdminIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    const admin = admins.find((a) => a.id === id);
    // 소유자는 선택할 수 없음
    if (admin?.role === "소유자") return;

    setSelectedAdminIds((prev) =>
      prev.includes(id)
        ? prev.filter((adminId) => adminId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedAdminIds.length === 0) return;
    // TODO: API 호출로 삭제 처리
    setSelectedAdminIds([]);
  };

  const handleDeleteSingle = (id: number) => {
    // TODO: API 호출로 삭제 처리
    setSelectedAdminIds((prev) => prev.filter((adminId) => adminId !== id));
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      showInviteMessage("초대 코드를 불러온 뒤 다시 시도해주세요.");
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

  const handleRefreshInviteCode = () => {
    if (isRefreshingInvite) {
      return;
    }
    if (!hasValidCouncilId) {
      const fallbackCode = generateInviteCode();
      setInviteCode(fallbackCode);
      showInviteMessage("새 초대 코드가 발급되었어요.");
      return;
    }
    if (!inviteCode) {
      showInviteMessage("초대 코드를 불러온 뒤 다시 시도해주세요.");
      return;
    }
    regenerateInviteCode(inviteCode);
  };

  const selectedCount = selectedAdminIds.length;

  return (
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
                disabled={selectedCount === 0}
                className="text-sm font-semibold text-red-500 transition enabled:hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
              >
                삭제하기
              </button>
            </div>

            <div className="hidden md:grid md:grid-cols-[auto_1.2fr_1.1fr_1.7fr_auto] md:items-center md:gap-4 md:rounded-lg md:border md:border-transparent md:bg-transparent md:px-4 md:text-sm md:text-gray-500 md:[&>*]:py-2">
              <span>
                <input
                  ref={masterCheckboxRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: "var(--primary)" }}
                />
              </span>
              <span>관리자명</span>
              <span>역할</span>
              <span>이메일</span>
              <span className="text-right"> </span>
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
                admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="grid grid-cols-[auto] items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm md:grid-cols-[auto_1.2fr_1.1fr_1.7fr_auto]"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAdminIds.includes(admin.id)}
                        onChange={() => toggleSelectOne(admin.id)}
                        disabled={admin.role === "소유자"}
                        className="h-4 w-4"
                        style={{
                          accentColor: "var(--primary)",
                          cursor:
                            admin.role === "소유자" ? "not-allowed" : "pointer",
                        }}
                      />
                      <div className="flex flex-col gap-1 text-base font-medium text-gray-900 md:hidden">
                        <span>{admin.name}</span>
                        <span className="text-13-medium text-primary">
                          {admin.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {admin.email}
                        </span>
                      </div>
                    </label>
                    <span className="hidden text-base font-medium text-gray-900 md:block">
                      {admin.name}
                    </span>
                    <span className="hidden text-sm font-medium text-primary md:block md:text-base">
                      {admin.role}
                    </span>
                    <span className="text-sm text-gray-500 md:pl-4 md:text-base">
                      {admin.email}
                    </span>
                    {admin.role !== "소유자" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(admin.id)}
                        className="justify-self-end text-sm font-medium text-red-500 transition hover:underline"
                      >
                        삭제
                      </button>
                    )}
                    {admin.role === "소유자" && (
                      <span className="justify-self-end"></span>
                    )}
                  </div>
                ))
              )}
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
                <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow">
                  <input
                    readOnly
                    value={inviteCode}
                    placeholder={
                      isInviteLoading ? "초대 코드를 불러오는 중..." : undefined
                    }
                    className="flex-1 bg-transparent text-center text-lg font-semibold tracking-[0.08em] text-gray-900 outline-none sm:text-2xl"
                  />
                  <button
                    type="button"
                    onClick={handleRefreshInviteCode}
                    disabled={isInviteLoading || isRefreshingInvite}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="초대 코드 새로 발급"
                  >
                    <RefreshCw
                      className={clsx(
                        "h-5 w-5",
                        (isInviteLoading || isRefreshingInvite) && "animate-spin"
                      )}
                    />
                  </button>
                </div>
                <div className="flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleCopyInviteCode}
                    disabled={
                      !inviteCode || isInviteLoading || isRefreshingInvite
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-16-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Copy className="h-5 w-5" strokeWidth={1.8} />
                    복사
                  </button>
                  {inviteMessage && (
                    <p
                      className="text-14-semibold text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      {inviteMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SettingMain;
