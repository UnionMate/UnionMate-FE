export const MAX_OPTIONS = 5;

export const FIXED_FIELDS = [
  {
    id: "applicant-name",
    label: "이름",
    placeholder: "이름을 입력해주세요.",
    type: "text" as const,
  },
  {
    id: "applicant-phone",
    label: "전화번호",
    placeholder: "전화번호를 입력해주세요.",
    type: "tel" as const,
  },
  {
    id: "applicant-email",
    label: "이메일",
    placeholder: "이메일을 입력해주세요.",
    type: "email" as const,
  },
] as const;

export type FixedField = (typeof FIXED_FIELDS)[number];
