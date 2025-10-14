import FormEditMain from "@/widget/formEdit/ui/FormEditMain";
import FormEditSidebar from "@/widget/formEdit/ui/FormEditSidebar";
import { useCallback, useRef, useState } from "react";
import type { QuestionConfig } from "@/widget/formEdit/ui/FormEditMain";

const FormEditPage = () => {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const questionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const handleReorder = (reorderedQuestions: QuestionConfig[]) => {
    setQuestions(reorderedQuestions);
  };

  const handleRegisterQuestionRef = useCallback(
    (questionId: string, node: HTMLDivElement | null) => {
      if (node) {
        questionRefs.current.set(questionId, node);
      } else {
        questionRefs.current.delete(questionId);
      }
    },
    []
  );

  const handleSelectQuestion = useCallback((questionId: string) => {
    const target = questionRefs.current.get(questionId);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, []);

  const handleRemoveQuestion = useCallback(
    (questionId: string) => {
      setQuestions((prev) =>
        prev.filter((question) => question.id !== questionId)
      );
      questionRefs.current.delete(questionId);
    },
    [setQuestions]
  );

  return (
    <div className="flex flex-row w-full h-full overflow-y-auto">
      <FormEditSidebar
        questions={questions}
        onReorder={handleReorder}
        onSelectQuestion={handleSelectQuestion}
        onRemoveQuestion={handleRemoveQuestion}
      />
      <FormEditMain
        questions={questions}
        setQuestions={setQuestions}
        registerQuestionRef={handleRegisterQuestionRef}
        onRemoveQuestion={handleRemoveQuestion}
      />
    </div>
  );
};

export default FormEditPage;
