export type ApplicantStatus = "pass" | "fail" | "pending";

export interface ApplicantMemo {
  id: string;
  author: string;
  content: string;
  isMine: boolean;
  createdAt: string;
}

type ParagraphQuestion = {
  id: string;
  type: "paragraph";
  question: string;
  answer: string;
};

type CheckboxQuestion = {
  id: string;
  type: "checkbox";
  question: string;
  options: string[];
  selected: string[];
};

export type ApplicantQuestion = ParagraphQuestion | CheckboxQuestion;

export interface ApplicantProfileField {
  label: string;
  value: string;
}

export interface ApplicantDetail {
  id: string;
  name: string;
  status: ApplicantStatus;
  appliedTrack: string;
  submittedAt: string;
  steps: string[];
  profile: ApplicantProfileField[];
  questions: ApplicantQuestion[];
  memos: ApplicantMemo[];
  evaluationStatus?: string;
  interview: {
    date: string;
    time: string;
    location: string;
    rawTime?: string;
  };
  reactions: {
    cheer: number;
    impressed: number;
    curious: number;
  };
}
