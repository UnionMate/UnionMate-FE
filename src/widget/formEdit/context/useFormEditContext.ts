import { useContext } from "react";
import { FormEditContext } from "./FormEditContext";

export const useFormEditContext = () => {
  const context = useContext(FormEditContext);

  if (!context) {
    throw new Error("useFormEditContext must be used within FormEditProvider");
  }

  return context;
};
