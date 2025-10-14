import FormEditMain from "@/widget/formEdit/ui/FormEditMain";
import FormEditSidebar from "@/widget/formEdit/ui/FormEditSidebar";
import { useState } from "react";
import type { QuestionConfig } from "@/widget/formEdit/ui/FormEditMain";

const FormEditPage = () => {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);

  const handleReorder = (reorderedQuestions: QuestionConfig[]) => {
    setQuestions(reorderedQuestions);
  };

  return (
    <div className="flex flex-row w-full h-full overflow-y-auto">
      <FormEditSidebar questions={questions} onReorder={handleReorder} />
      <FormEditMain questions={questions} setQuestions={setQuestions} />
    </div>
  );
};

export default FormEditPage;
