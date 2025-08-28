import Button from "@/shared/components/Button";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InputUiProps {
  onSuccess: (clubName: string) => void;
}

const InputUi = ({ onSuccess }: InputUiProps) => {
  const [clubName, setClubName] = useState("");

  const handleConfirm = () => {
    if (!clubName.trim()) {
      toast.error("입력된 내용이 없습니다.", {
        position: "bottom-center",
        style: {
          background: "#374151",
          color: "white",
        },
      });
      return;
    }

    // 동아리 생성 로직
    console.log("동아리 생성 확인:", clubName);
    onSuccess(clubName);
  };

  return (
    <>
      <div className="w-full space-y-8 text-center">
        {/* 파티 폭죽 아이콘 */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center">
            <PartyPopper className="w-20 h-20 text-primary" />
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">환영합니다!</h1>
          <p className="text-2xl font-bold text-gray-900 tracking-wide">
            생성하실 동아리명을 입력해 주세요.
          </p>
          <p className="text-sm text-gray-500">
            동아리명은 동아리 관리 페이지에서 추후 수정 가능합니다.
          </p>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-6 max-w-[500px] mx-auto">
          <input
            type="text"
            placeholder="동아리명을 입력하세요"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className="w-full px-4 py-3 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 focus:outline-primary"
          />

          {/* 확인 버튼 */}
          <div className="flex justify-center mt-8">
            <Button buttonText="확인" onClick={handleConfirm} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InputUi;
