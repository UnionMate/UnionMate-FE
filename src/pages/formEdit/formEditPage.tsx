import FormEditMain from "@/widget/formEdit/ui/FormEditMain";
import FormEditSidebar from "@/widget/formEdit/ui/FormEditSidebar";

const formEditPage = () => {
  return (
    <div className="flex flex-row w-full h-[100dvh]">
      <FormEditSidebar />
      <FormEditMain />
    </div>
  );
};

export default formEditPage;
