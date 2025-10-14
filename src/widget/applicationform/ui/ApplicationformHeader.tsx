import { File } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationformHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between">
      <div className="flex gap-6">
        <div className="flex gap-2 items-center">
          <File className="w-8 h-8 text-primary" />
          <div className="flex text-[28px] font-semibold">지원서 양식</div>
        </div>
        <div className="flex text-16-medium items-center text-gray-400">
          지원서 양식을 등록하여 지원자들이 지원서를 작성할 수 있습니다.
        </div>
      </div>
      <div className="flex">
        <button
          className="flex px-6 h-[32px] bg-primary items-center justify-center rounded-sm cursor-pointer"
          onClick={() => {
            navigate("/applicationform/edit");
          }}
        >
          <div className="flex text-[13px] font-semibold text-white">
            지원서 양식 추가
          </div>
        </button>
      </div>
    </div>
  );
};

export default ApplicationformHeader;
