import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { useChangeCouncilName } from "@/api/changeCouncilName";

const ChangeClubNameContainer = () => {
  const { councilId } = useParams<{ councilId: string }>();
  const [savedClubName, setSavedClubName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const { mutate: changeName, isPending } = useChangeCouncilName(
    councilId || ""
  );

  const isSaveDisabled = useMemo(() => {
    const trimmed = draftName.trim();
    return trimmed.length === 0 || trimmed === savedClubName || isPending;
  }, [draftName, savedClubName, isPending]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (nextName.length === 0 || nextName === savedClubName || !councilId)
      return;

    changeName(
      { name: nextName },
      {
        onSuccess: (response) => {
          console.log("학생회명 변경 성공:", response);
          setSavedClubName(response.data.councilName);
          setDraftName(response.data.councilName);
    setStatusMessage("학생회명이 저장되었어요.");
    setTimeout(() => setStatusMessage(""), 2000);
        },
        onError: (error) => {
          console.error("학생회명 변경 실패:", error);
          setStatusMessage("학생회명 변경에 실패했습니다.");
          setTimeout(() => setStatusMessage(""), 2000);
        },
      }
    );
  };

  const handleReset = () => {
    setDraftName("");
    setStatusMessage("");
  };

  return (
    <section className="w-full rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersRound className="h-6 w-6" />
          </div>
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-title-20-bold text-gray-900">학생회 관리</h1>
            <p className="text-16-regular text-gray-500">
              학생회 관리자를 초대 코드로 추가하거나, 삭제할 수 있어요
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex w-full flex-1 flex-col gap-3">
          <label
            htmlFor="club-name"
            className="text-title-16-semibold text-gray-500"
          >
            새 학생회명
          </label>
          <input
            id="club-name"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-16-regular text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="변경할 학생회명을 입력하세요"
            maxLength={30}
          />
          <p className="text-14-regular text-gray-500">
            현재 등록된 학생회명은 표시되지 않아요. 바꾸고 싶은 이름을 직접
            입력해 주세요.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 px-4 py-2 text-15-medium text-gray-600 transition hover:bg-gray-100"
          >
            초기화
          </button>
          <button
            type="submit"
            disabled={isSaveDisabled}
            className="rounded-lg bg-primary px-5 py-2 text-15-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            저장
          </button>
        </div>
      </form>

      {statusMessage && (
        <p className="mt-3 text-14-semibold text-primary">{statusMessage}</p>
      )}
    </section>
  );
};

export default ChangeClubNameContainer;
