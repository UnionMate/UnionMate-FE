import { ArrowLeft, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFormEditPage = location.pathname === "/applicationform/edit";

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = () => {
    navigate("/applicationform");
  };

  return (
    <div className="flex w-full items-center justify-between bg-white px-6 py-3 shadow-[0_4px_25px_1px_rgba(0,0,0,0.05)]">
      <div className="flex gap-4">
        <div className="flex font-bold text-2xl tracking-[0.08em] text-black-100">
          UnionMate
        </div>
      </div>

      {isFormEditPage && (
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
