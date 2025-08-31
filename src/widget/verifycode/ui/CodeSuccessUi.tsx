import Button from "@/shared/components/Button";
import { Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CodeSuccessUi = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/recruit");
    // 시작하기 로직
    console.log("시작하기 클릭");
  };

  return (
    <div className="w-full space-y-8 text-center">
      {/* 깃발 아이콘 */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center">
          <Flag className="w-20 h-20 text-primary" />
        </div>
      </div>

      {/* 환영 메시지 */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-primary">000</span>의 관리자님, 반가워요!
        </h1>
        <p className="text-2xl font-bold text-gray-900 tracking-wide">
          지금부터 UnionMate에서 동아리를 모집하고 관리해요.
        </p>
        <p className="text-sm text-gray-500">
          모집 리스트에서 현재 진행 중인 모집을 확인할 수 있습니다.
        </p>
        <p className="text-sm text-gray-500">
          다른 관리자들과 함께 동아리 모집을 시작해보세요!
        </p>
      </div>

      {/* 시작하기 버튼 */}
      <div className="flex justify-center mt-15">
        <Button buttonText="시작하기" onClick={handleStart} />
      </div>
    </div>
  );
};

export default CodeSuccessUi;
