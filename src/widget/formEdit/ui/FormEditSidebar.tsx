import type { QuestionConfig } from "../types";
import { GripVertical, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

type FormEditSidebarProps = {
  questions: QuestionConfig[];
  onReorder: (questions: QuestionConfig[]) => void;
  onSelectQuestion: (questionId: string) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const FormEditSidebar = ({
  questions,
  onReorder,
  onSelectQuestion,
  onRemoveQuestion,
}: FormEditSidebarProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newQuestions = [...questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedItem);

    onReorder(newQuestions);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const getQuestionLabel = (type: QuestionConfig["type"]) => {
    switch (type) {
      case "single-check":
        return "단일 체크";
      case "multi-check":
        return "복수 체크";
      case "short-answer":
        return "단문형 답변";
      case "long-answer":
        return "장문형 답변";
      case "date-picker":
        return "날짜 선택";
      case "description":
        return "설명 추가";
      default:
        return "질문";
    }
  };

  const getQuestionColor = (type: QuestionConfig["type"]) => {
    switch (type) {
      case "single-check":
        return "bg-[#F8F0FF] text-[#7C4DFF]";
      case "multi-check":
        return "bg-[#E7F1FF] text-[#2F78FF]";
      case "short-answer":
        return "bg-[#E8F5E9] text-[#4CAF50]";
      case "long-answer":
        return "bg-[#FFF3E0] text-[#FF9800]";
      case "date-picker":
        return "bg-[#E0F2F1] text-[#009688]";
      case "description":
        return "bg-[#F3E5F5] text-[#9C27B0]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-r border-black-10 bg-white p-6">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex text-title-18-semibold text-black-100">
          질문 리스트
        </div>
        <div className="flex text-14-medium text-black-60">
          드래그를 통해 순서를 변경할 수 있어요
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-14-medium text-black-40 text-center py-8">
            질문을 추가해주세요
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={clsx(
                "flex items-center gap-3 p-4 rounded-xl border transition cursor-move",
                draggedIndex === index
                  ? "opacity-50 bg-black-10 border-black-20"
                  : dragOverIndex === index
                  ? "bg-primary/10 border-primary/50 shadow-lg"
                  : "bg-black-5 border-black-15 hover:border-primary/30 hover:bg-primary/5"
              )}
              onClick={() => {
                if (!isDragging) {
                  onSelectQuestion(question.id);
                }
              }}
            >
              <GripVertical
                className="h-5 w-5 text-black-40"
                strokeWidth={1.5}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-15-medium text-black-80">
                    {index + 1}.
                  </span>
                  <span className="max-w-[160px] truncate text-15-semibold text-black-90">
                    {question.title || "제목 없음"}
                  </span>
                </div>
                <span
                  className={clsx(
                    "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                    getQuestionColor(question.type)
                  )}
                >
                  {getQuestionLabel(question.type)}
                </span>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black-35 transition hover:bg-primary/10 hover:text-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveQuestion(question.id);
                }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormEditSidebar;
