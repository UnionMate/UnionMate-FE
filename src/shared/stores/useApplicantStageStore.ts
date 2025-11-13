import { create } from "zustand";
import type { ApplicantStatus } from "@/widget/recruitdetail/types";

export type ApplicantStage = {
  evaluationStatus?: string;
  recruitmentStatus?: string;
  status?: ApplicantStatus;
};

export type ApplicantStageKey = string;

export const buildApplicantStageKey = (
  email: string | null | undefined,
  appliedAt: string | null | undefined
): ApplicantStageKey => {
  return `${email ?? ""}__${appliedAt ?? ""}`;
};

type ApplicantStageStore = {
  stages: Record<ApplicantStageKey, ApplicantStage>;
  bulkSet: (
    entries: Array<{ key: ApplicantStageKey; stage: ApplicantStage }>
  ) => void;
  setStage: (key: ApplicantStageKey, stage: ApplicantStage) => void;
  getStage: (key: ApplicantStageKey) => ApplicantStage | undefined;
  reset: () => void;
};

export const useApplicantStageStore = create<ApplicantStageStore>(
  (set, get) => ({
    stages: {},
    bulkSet: (entries) =>
      set((state) => {
        const next = { ...state.stages };
        entries.forEach(({ key, stage }) => {
          next[key] = { ...next[key], ...stage };
        });
        return { stages: next };
      }),
    setStage: (key, stage) =>
      set((state) => ({
        stages: { ...state.stages, [key]: { ...state.stages[key], ...stage } },
      })),
    getStage: (key) => get().stages[key],
    reset: () => set({ stages: {} }),
  })
);
