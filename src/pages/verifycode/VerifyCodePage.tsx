import { useState } from "react";
import CodeInputUi from "@/widget/verifycode/ui/CodeInputUi";
import CodeSuccessUi from "@/widget/verifycode/ui/CodeSuccessUi";

const VerifyCodePage = () => {
  const [currentView, setCurrentView] = useState<"input" | "success">("input");
  const [councilName, setCouncilName] = useState<string | undefined>();

  const handleViewChange = (view: "input" | "success", name?: string) => {
    if (name) {
      setCouncilName(name);
    }
    setCurrentView(view);
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      {currentView === "input" ? (
        <CodeInputUi onSuccess={(name) => handleViewChange("success", name)} />
      ) : (
        <CodeSuccessUi councilName={councilName} />
      )}
    </div>
  );
};

export default VerifyCodePage;
