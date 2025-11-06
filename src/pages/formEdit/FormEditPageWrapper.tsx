import FormEditPage from "./FormEditPage";
import { FormEditProvider } from "@/widget/formEdit/context/FormEditProvider";

const FormEditPageWrapper = () => {
  return (
    <FormEditProvider>
      <FormEditPage />
    </FormEditProvider>
  );
};

export default FormEditPageWrapper;
