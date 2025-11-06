import Button from "@/shared/components/Button";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CodeInputUiProps {
  onSuccess: (councilName?: string) => void;
}

const CodeInputUi = ({ onSuccess }: CodeInputUiProps) => {
  const [inviteCode, setInviteCode] = useState("");

  const handleConfirm = () => {
    if (!inviteCode.trim()) {
      toast.error("입력된 내용이 없습니다.", {
        position: "bottom-center",
        style: {
          background: "#374151",
          color: "white",
        },
      });
      return;
    }

    // 초대 코드 확인 로직
    console.log("초대 코드 확인:", inviteCode);
    onSuccess();
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
            관리자에게 받은 초대 코드를 입력해주세요.
          </p>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-6 max-w-[500px] mx-auto">
          <input
            type="text"
            placeholder="초대 코드를 입력하세요"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
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

export default CodeInputUi;
