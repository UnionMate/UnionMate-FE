import type {
  ApplicantDetail,
  ApplicantMemo,
  ApplicantStatus,
} from "../types";

export const REVIEWER_DISPLAY_NAME = "나 (담당자)";

export const APPLICANT_STATUS_OPTIONS: ApplicantStatus[] = [
  "pass",
  "fail",
  "pending",
];

export const statusLabelMap: Record<ApplicantStatus, string> = {
  pass: "합격",
  fail: "불합격",
  pending: "평가 대기",
};

export const statusToneMap: Record<ApplicantStatus, string> = {
  pass: "bg-primary/10 text-primary",
  fail: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export const statusBadgeMap: Record<ApplicantStatus, string> = {
  pass: "bg-primary/10 text-primary",
  fail: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export const makeMemoId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const baseApplicants: ApplicantDetail[] = [
  {
    id: "applicant-1",
    name: "이한결",
    status: "pending",
    appliedTrack: "프론트엔드 개발",
    submittedAt: "2024-02-05T09:10:00+09:00",
    steps: ["서류 심사", "면접"],
    profile: [
      { label: "지원자명", value: "이한결" },
      { label: "지원 포지션", value: "프론트엔드 개발" },
      { label: "전공", value: "컴퓨터공학과" },
      { label: "전화번호", value: "010-1234-5678" },
      { label: "이메일", value: "hankyeol@example.com" },
      { label: "학년", value: "3학년" },
    ],
    questions: [
      {
        id: "q1",
        type: "paragraph",
        question: "무언가 열심히 해서 얻은 경험은 무엇인가요?",
        answer:
          "기존 동아리 홈페이지를 리뉴얼하면서 비회원도 쉽게 접근할 수 있는 인터페이스를 설계했습니다. 초반에는 기획, 디자인, 프론트엔드 구현까지 혼자 맡으며 일정이 촉박했지만, 협업 도구와 CI 파이프라인을 도입해 시간을 단축했고, 결과적으로 출시 직후 회원가입 전환율이 두 배 증가했습니다.",
      },
      {
        id: "q2",
        type: "paragraph",
        question: "지금까지 가장 어려웠던 프로젝트와 그 과정에서 배운 점은 무엇인가요?",
        answer:
          "타 학과와 협업한 해커톤에서 대규모 데이터를 시각화하는 대시보드를 구현했습니다. 제한된 시간 안에 복잡한 상태 관리를 처리해야 했기 때문에 Recoil과 React Query를 결합해 데이터 흐름을 분리했고, 사용자 행동 로그를 활용해 우선순위를 재조정했습니다. 이 과정에서 팀원과의 적극적인 피드백 루프가 프로젝트 완성도를 크게 높인다는 것을 체감했습니다.",
      },
      {
        id: "q3",
        type: "checkbox",
        question: "동아리를 알게 된 경로를 체크해주세요.",
        options: ["지인 추천", "에브리타임", "동아리 랜딩페이지", "기타"],
        selected: ["지인 추천", "기타"],
      },
    ],
    memos: [
      {
        id: "memo-1",
        author: "강 근덕",
        content:
          "캐나다 교환학생 기간에 작성했던 포트폴리오가 꽤 잘 정리돼 있다고 느꼈습니다. 질문마다 사례가 구체적이에요.",
        isMine: false,
        createdAt: "2024-02-05T10:20:00+09:00",
      },
      {
        id: "memo-2",
        author: REVIEWER_DISPLAY_NAME,
        content:
          "과제 제출 일정 공유가 빠르고, 협업 도구에 익숙해 보여서 실무 적응이 빠를 것 같습니다.",
        isMine: true,
        createdAt: "2024-02-06T09:45:00+09:00",
      },
    ],
    interview: {
      date: "24.02.10",
      time: "PM 03:00",
      location: "경기도 성남시 수정구 수룡1길 11 3F 스터디룸 2",
    },
    reactions: {
      cheer: 3,
      impressed: 2,
      curious: 1,
    },
  },
  {
    id: "applicant-2",
    name: "박소현",
    status: "pass",
    appliedTrack: "마케팅 팀",
    submittedAt: "2024-02-04T14:25:00+09:00",
    steps: ["서류 심사", "면접"],
    profile: [
      { label: "지원자명", value: "박소현" },
      { label: "지원 포지션", value: "콘텐츠 마케팅" },
      { label: "전공", value: "경영학과" },
      { label: "전화번호", value: "010-8765-4321" },
      { label: "이메일", value: "sohyun@example.com" },
      { label: "학년", value: "4학년" },
    ],
    questions: [
      {
        id: "q1",
        type: "paragraph",
        question: "무언가 열심히 해서 얻은 경험은 무엇인가요?",
        answer:
          "교내 홍보대사 활동을 하면서 SNS 콘텐츠 기획과 광고 캠페인을 직접 운영했습니다. 팔로워의 행동 데이터로 A/B 테스트를 반복하며 콘텐츠 방향성을 정리했고, 평균 조회 수 대비 280% 높은 성과를 얻었습니다.",
      },
      {
        id: "q2",
        type: "paragraph",
        question: "지금까지 가장 어려웠던 프로젝트와 그 과정에서 배운 점은 무엇인가요?",
        answer:
          "지역 축제와 연계한 협업 프로젝트에서 파트너사와 일정이 계속 어긋났습니다. 프로젝트 관리 툴을 도입해 업무를 세분화하고, 주간 리포트를 공유하도록 프로세스를 정비해 일정 지연을 최소화했습니다.",
      },
      {
        id: "q3",
        type: "checkbox",
        question: "동아리를 알게 된 경로를 체크해주세요.",
        options: ["지인 추천", "에브리타임", "동아리 랜딩페이지", "기타"],
        selected: ["에브리타임", "동아리 랜딩페이지"],
      },
    ],
    memos: [
      {
        id: "memo-3",
        author: "정 윤기",
        content: "브랜딩 방향에 대한 이해도가 높아서 캠페인 팀에 배치하기 좋겠습니다.",
        isMine: false,
        createdAt: "2024-02-04T15:05:00+09:00",
      },
      {
        id: "memo-4",
        author: REVIEWER_DISPLAY_NAME,
        content: "이미 면접 제안 완료. 합격 시 온보딩 자료 전달 예정입니다.",
        isMine: true,
        createdAt: "2024-02-05T16:30:00+09:00",
      },
    ],
    interview: {
      date: "24.02.11",
      time: "PM 02:00",
      location: "경기도 성남시 수정구 수룡1길 11 3F 스터디룸 1",
    },
    reactions: {
      cheer: 5,
      impressed: 4,
      curious: 0,
    },
  },
  {
    id: "applicant-3",
    name: "김도윤",
    status: "fail",
    appliedTrack: "백엔드 개발",
    submittedAt: "2024-02-03T18:40:00+09:00",
    steps: ["서류 심사", "면접"],
    profile: [
      { label: "지원자명", value: "김도윤" },
      { label: "지원 포지션", value: "백엔드 개발" },
      { label: "전공", value: "정보통신공학과" },
      { label: "전화번호", value: "010-9988-7766" },
      { label: "이메일", value: "doyun@example.com" },
      { label: "학년", value: "2학년" },
    ],
    questions: [
      {
        id: "q1",
        type: "paragraph",
        question: "무언가 열심히 해서 얻은 경험은 무엇인가요?",
        answer:
          "교내 공모전에서 REST API 서버를 설계하면서 테스트 자동화 파이프라인을 구축했습니다. 서버 자원을 효율적으로 쓰기 위해 캐싱 전략을 설계한 경험이 있습니다.",
      },
      {
        id: "q2",
        type: "paragraph",
        question: "지금까지 가장 어려웠던 프로젝트와 그 과정에서 배운 점은 무엇인가요?",
        answer:
          "대규모 트래픽을 대비한 확장성 설계 경험은 아직 부족하지만, 스터디를 통해 AWS 기반 인프라를 학습 중입니다.",
      },
      {
        id: "q3",
        type: "checkbox",
        question: "동아리를 알게 된 경로를 체크해주세요.",
        options: ["지인 추천", "에브리타임", "동아리 랜딩페이지", "기타"],
        selected: ["동아리 랜딩페이지"],
      },
    ],
    memos: [
      {
        id: "memo-5",
        author: REVIEWER_DISPLAY_NAME,
        content:
          "서류에서 협업 경험이 부족하게 보여서 추후 모집 때 성장한 내용이 있으면 좋겠습니다.",
        isMine: true,
        createdAt: "2024-02-03T11:10:00+09:00",
      },
    ],
    interview: {
      date: "24.02.12",
      time: "PM 04:00",
      location: "경기도 성남시 수정구 수룡1길 11 3F 세미나실",
    },
    reactions: {
      cheer: 1,
      impressed: 0,
      curious: 2,
    },
  },
];

const cloneMemo = (memo: ApplicantMemo): ApplicantMemo => ({ ...memo });

export const createInitialApplicants = (): ApplicantDetail[] =>
  baseApplicants.map((applicant) => ({
    ...applicant,
    profile: applicant.profile.map((field) => ({ ...field })),
    steps: [...applicant.steps],
    questions: applicant.questions.map((question) =>
      question.type === "checkbox"
        ? {
            ...question,
            options: [...question.options],
            selected: [...question.selected],
          }
        : { ...question },
    ),
    memos: applicant.memos.map(cloneMemo),
    interview: { ...applicant.interview },
    reactions: { ...applicant.reactions },
  }));

export const findApplicantById = (
  applicantId: string,
): ApplicantDetail | undefined =>
  createInitialApplicants().find((applicant) => applicant.id === applicantId);
