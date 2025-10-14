import ApplicationformHeader from "@/widget/applicationform/ui/ApplicationformHeader";
import ApplicationformMain from "@/widget/applicationform/ui/ApplicationformMain";

const ApplicationformPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4">
      <ApplicationformHeader />
      <ApplicationformMain />
    </div>
  );
};

export default ApplicationformPage;
