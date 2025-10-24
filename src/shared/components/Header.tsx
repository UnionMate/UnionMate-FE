import { ArrowLeft, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createRecruitment } from "@/api/recruitment";
import { convertFormDataToApiRequest } from "@/api/formDataConverter";
import { useContext } from "react";
import { FormEditContext } from "@/widget/formEdit/context/FormEditContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // FormEditContext가 존재하는지 확인
  const formEditContext = useContext(FormEditContext);
  const { formName, endDate, endTime, questions } = formEditContext || {
    formName: "",
    endDate: null,
    endTime: "00:00",
    questions: [],
  };

  const isFormEditPage = location.pathname === "/applicationform/edit";

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    // FormEditContext가 없으면 실행하지 않음
    if (!formEditContext) {
      console.warn("FormEditContext가 없습니다.");
      return;
    }

    // 유효성 검사
    if (!formName.trim()) {
      alert("지원서 제목을 입력해주세요.");
      return;
    }

    if (!endDate) {
      alert("지원 기간 종료일을 선택해주세요.");
      return;
    }

    if (!endTime) {
      alert("지원 기간 종료 시간을 선택해주세요.");
      return;
    }

    if (questions.length === 0) {
      alert("최소 1개 이상의 질문을 추가해주세요.");
      return;
    }

    try {
      // 폼 데이터를 API 형식으로 변환
      const recruitmentData = convertFormDataToApiRequest(
        formName.trim(),
        endDate,
        endTime,
        questions
      );

      // API 호출
      await createRecruitment(recruitmentData);

      // 성공 시 페이지 이동
      navigate("/applicationform");
    } catch (error) {
      console.error("지원서 양식 생성 실패:", error);

      if (error instanceof Error && error.message.includes("403")) {
        alert("로그인이 필요합니다. 먼저 로그인해주세요.");
        navigate("/login");
      } else {
        alert("지원서 양식 생성에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-between bg-white px-6 py-3 shadow-[0_4px_25px_1px_rgba(0,0,0,0.05)]">
      <div className="flex gap-4">
        <div className="flex font-bold text-2xl tracking-[0.08em] text-black-100">
          UnionMate
        </div>
      </div>

      {isFormEditPage && formEditContext && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-xl border border-black-15 bg-white px-4 py-2 text-title-14-semibold text-black-80 transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로가기</span>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-title-14-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>지원서 양식 생성</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
