export interface RecruitCardData {
  id: number;
  title: string;
  description: string;
  isPosted?: boolean;
}

export const recruitCardList: RecruitCardData[] = [
  {
    id: 1,
    title: "유니온 1기",
    description: "프론트엔드",
    isPosted: false,
  },
  {
    id: 2,
    title: "유니온 2기",
    description: "백엔드",
    isPosted: false,
  },
];

export const getRecruitById = (id: number) =>
  recruitCardList.find((recruit) => recruit.id === id);
