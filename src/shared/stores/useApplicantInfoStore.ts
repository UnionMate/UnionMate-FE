import { create } from "zustand";

type ApplicantInfoState = {
  name: string;
  email: string;
  setApplicantInfo: (info: { name: string; email: string }) => void;
  reset: () => void;
};

const initialState = {
  name: "",
  email: "",
};

export const useApplicantInfoStore = create<ApplicantInfoState>((set) => ({
  ...initialState,
  setApplicantInfo: ({ name, email }) =>
    set({
      name: name.trim(),
      email: email.trim(),
    }),
  reset: () => set(initialState),
}));
