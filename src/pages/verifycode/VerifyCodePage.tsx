import { useState } from "react";
import CodeInputUi from "@/widget/verifycode/ui/CodeInputUi";
import CodeSuccessUi from "@/widget/verifycode/ui/CodeSuccessUi";

const VerifyCodePage = () => {
  const [currentView, setCurrentView] = useState<"input" | "success">("input");

  const handleViewChange = (view: "input" | "success") => {
    setCurrentView(view);
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      {currentView === "input" ? (
        <CodeInputUi onSuccess={() => handleViewChange("success")} />
      ) : (
        <CodeSuccessUi />
      )}
    </div>
  );
};

export default VerifyCodePage;
