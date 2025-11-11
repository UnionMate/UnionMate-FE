import { useState } from "react";
import CodeInputUi from "@/widget/verifycode/ui/CodeInputUi";
import CodeSuccessUi from "@/widget/verifycode/ui/CodeSuccessUi";

const VerifyCodePage = () => {
  const [currentView, setCurrentView] = useState<"input" | "success">("input");
  const [councilName, setCouncilName] = useState<string | undefined>();
  const [councilId, setCouncilId] = useState<number | undefined>();

  const handleSuccess = ({
    councilName: name,
    councilId: joinedCouncilId,
  }: {
    councilName: string;
    councilId: number;
  }) => {
    setCouncilName(name);
    setCouncilId(joinedCouncilId);
    setCurrentView("success");
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      {currentView === "input" ? (
        <CodeInputUi onSuccess={handleSuccess} />
      ) : (
        <CodeSuccessUi councilName={councilName} councilId={councilId} />
      )}
    </div>
  );
};

export default VerifyCodePage;
