import { createContext } from "react";
import type { QuestionConfig } from "../types";

export type FormEditContextValue = {
  name: string;
  setName: (value: string) => void;
  endDate: Date | null;
  setEndDate: (value: Date | null) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  questions: QuestionConfig[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionConfig[]>>;
  resetPeriod: () => void;
  resetAll: () => void;
};

export const FormEditContext = createContext<FormEditContextValue | null>(null);
