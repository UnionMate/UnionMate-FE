import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const RecruitButton = () => {
  const navigate = useNavigate();
  const { councilId } = useParams<{ councilId: string }>();

  return (
    <div className="flex justify-end">
      <button
        className="flex px-3 py-1 bg-primary rounded-sm cursor-pointer"
        onClick={() => {
          if (councilId) {
            navigate(`/${councilId}/applicationform/edit`);
          }
        }}
      >
        <div className="flex gap-1 items-center justify-center">
          <Plus className="w-4.5 h-4.5 text-white" />
          <div className="flex text-title-16-semibold text-white">
            모집 추가
          </div>
        </div>
      </button>
    </div>
  );
};

export default RecruitButton;
