import { useState } from "react";
import InputUi from "@/widget/createclub/ui/InputUi";
import SuccessUi from "@/widget/createclub/ui/SuccessUi";

const CreateClubPage = () => {
  const [currentView, setCurrentView] = useState<"input" | "success">("input");
  const [clubName, setClubName] = useState("");
  const [councilId, setCouncilId] = useState<number | null>(null);

  const handleViewChange = (
    view: "input" | "success",
    id?: number,
    name?: string
  ) => {
    if (id !== undefined && name) {
      setCouncilId(id);
      setClubName(name);
    }
    setCurrentView(view);
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      {currentView === "input" ? (
        <InputUi
          onSuccess={(id, name) => handleViewChange("success", id, name)}
        />
      ) : (
        <SuccessUi clubName={clubName} councilId={councilId} />
      )}
    </div>
  );
};

export default CreateClubPage;
