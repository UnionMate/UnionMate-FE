import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";

const ChangeClubNameContainer = () => {
  const [clubName, setClubName] = useState("평양라면");
  const [draftName, setDraftName] = useState(clubName);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const isSaveDisabled = useMemo(() => {
    const trimmed = draftName.trim();
    return trimmed.length === 0 || trimmed === clubName;
  }, [draftName, clubName]);

  const handleStartEdit = () => {
    setDraftName(clubName);
    setStatusMessage("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftName(clubName);
    setStatusMessage("");
    setIsEditing(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (nextName.length === 0 || nextName === clubName) return;

    setClubName(nextName);
    setIsEditing(false);

    setStatusMessage("동아리명이 저장되었어요.");
    setTimeout(() => setStatusMessage(""), 2000);
  };

  return (
    <section className="w-full rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersRound className="h-6 w-6" />
          </div>
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-title-20-bold text-gray-900">동아리 관리</h1>
            <p className="text-16-regular text-gray-500">
              동아리 관리자를 초대 코드로 추가하거나, 삭제할 수 있어요
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-10">
          <span className="text-title-16-semibold text-gray-500 flex w-fit whitespace-nowrap">
            동아리명
          </span>
          {isEditing ? (
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-16-regular text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="동아리명을 입력하세요"
              maxLength={30}
            />
          ) : (
            <span className="text-title-18-bold text-gray-900">{clubName}</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-15-medium text-gray-600 transition hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaveDisabled}
                className="rounded-lg bg-primary px-5 py-2 text-15-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                저장
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="text-15-semibold text-primary transition hover:underline"
            >
              변경
            </button>
          )}
        </div>
      </form>

      {statusMessage && (
        <p className="mt-3 text-14-semibold text-primary">{statusMessage}</p>
      )}
    </section>
  );
};

export default ChangeClubNameContainer;
