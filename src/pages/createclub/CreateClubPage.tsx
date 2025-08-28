import { useState } from "react";
import InputUi from "@/widget/createclub/ui/InputUi";
import SuccessUi from "@/widget/createclub/ui/SuccessUi";

const CreateClubPage = () => {
  const [currentView, setCurrentView] = useState<"input" | "success">("input");
  const [clubName, setClubName] = useState("");

  const handleViewChange = (view: "input" | "success", name?: string) => {
    if (name) {
      setClubName(name);
    }
    setCurrentView(view);
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      {currentView === "input" ? (
        <InputUi onSuccess={(name) => handleViewChange("success", name)} />
      ) : (
        <SuccessUi clubName={clubName} />
      )}
    </div>
  );
};

export default CreateClubPage;
