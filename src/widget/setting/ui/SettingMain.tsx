import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, MailOpen, RefreshCw } from "lucide-react";

type TabKey = "admins" | "invite";

interface AdminInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

const initialAdmins: AdminInfo[] = [
  { id: 1, name: "한마리", email: "owner@unionmate.com", role: "소유자" },
  { id: 2, name: "두마리", email: "admin@unionmate.com", role: "관리자" },
  { id: 3, name: "세마리", email: "editor@unionmate.com", role: "편집자" },
];

const generateInviteCode = () =>
  `UM-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

const SettingMain = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("admins");
  const [admins, setAdmins] = useState(initialAdmins);
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [inviteCode, setInviteCode] = useState(generateInviteCode());
  const [inviteMessage, setInviteMessage] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(60 * 60);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const allSelected = useMemo(
    () => admins.length > 0 && selectedAdminIds.length === admins.length,
    [admins.length, selectedAdminIds.length]
  );

  useEffect(() => {
    if (!masterCheckboxRef.current) return;
    masterCheckboxRef.current.indeterminate =
      selectedAdminIds.length > 0 && selectedAdminIds.length < admins.length;
  }, [admins.length, selectedAdminIds.length]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdminIds(admins.map((admin) => admin.id));
    } else {
      setSelectedAdminIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedAdminIds((prev) =>
      prev.includes(id)
        ? prev.filter((adminId) => adminId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedAdminIds.length === 0) return;

    setAdmins((prev) =>
      prev.filter((admin) => !selectedAdminIds.includes(admin.id))
    );
    setSelectedAdminIds([]);
  };

  const handleDeleteSingle = (id: number) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    setSelectedAdminIds((prev) => prev.filter((adminId) => adminId !== id));
  };

  const handleCopyInviteCode = async () => {
    if (typeof navigator === "undefined") return;
    try {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(inviteCode);
        setInviteMessage("초대 코드가 복사되었어요.");
      } else {
        setInviteMessage("복사를 지원하지 않는 환경이에요.");
      }
    } catch (error) {
      console.error(error);
      setInviteMessage("코드 복사에 실패했어요. 다시 시도해주세요.");
    } finally {
      setTimeout(() => setInviteMessage(""), 2500);
    }
  };

  const handleRefreshInviteCode = () => {
    setInviteCode(generateInviteCode());
    setInviteMessage("새 초대 코드가 발급되었어요.");
    setTimeout(() => setInviteMessage(""), 2500);
    setRemainingSeconds(60 * 60);
  };

  useEffect(() => {
    if (activeTab !== "invite") return;

    const timerId = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [activeTab]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

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
              {admins.length === 0 ? (
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
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <div className="flex flex-col gap-1 text-base font-medium text-gray-900 md:hidden">
                        <span>{admin.name}</span>
                        <span className="text-13-medium text-primary">
                          {admin.role}
                        </span>
                        <span className="text-sm text-gray-500">{admin.email}</span>
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
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(admin.id)}
                      className="justify-self-end text-sm font-medium text-red-500 transition hover:underline"
                    >
                      삭제
                    </button>
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
                  관리자 코드의 유효시간은 1시간 입니다.
                </p>
                <p className="text-14-regular text-gray-500">
                  시간이 만료되면 코드를 재발급 해주세요.
                </p>
              </div>
              <div className="flex w-full max-w-md flex-col items-center gap-4">
                <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow">
                  <span className="text-14-semibold text-error">
                    {formattedTime}
                  </span>
                  <input
                    readOnly
                    value={inviteCode}
                    className="flex-1 bg-transparent text-center text-title-20-bold tracking-[0.3em] text-gray-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRefreshInviteCode}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                    aria-label="초대 코드 새로 발급"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleCopyInviteCode}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-16-semibold text-white transition hover:bg-primary/90"
                  >
                    <Copy className="h-5 w-5" strokeWidth={1.8} />
                    복사
                  </button>
                  {inviteMessage && (
                    <p className="text-14-semibold text-primary">{inviteMessage}</p>
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
