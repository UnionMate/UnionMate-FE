import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { QuestionConfig } from "../types";
import { FormEditContext, type FormEditContextValue } from "./FormEditContext";

type FormEditProviderProps = {
  children: ReactNode;
};

export const FormEditProvider = ({ children }: FormEditProviderProps) => {
  const [formName, setFormName] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState("00:00");
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);

  const resetPeriod = useCallback(() => {
    setEndDate(null);
    setEndTime("00:00");
  }, []);

  const resetAll = useCallback(() => {
    setFormName("");
    resetPeriod();
    setQuestions([]);
  }, [resetPeriod]);

  const value = useMemo<FormEditContextValue>(
    () => ({
      formName,
      setFormName,
      endDate,
      setEndDate,
      endTime,
      setEndTime,
      questions,
      setQuestions,
      resetPeriod,
      resetAll,
    }),
    [formName, endDate, endTime, questions, resetPeriod, resetAll]
  );

  return (
    <FormEditContext.Provider value={value}>
      {children}
    </FormEditContext.Provider>
  );
};
