import RecruitCard from "../components/RecruitCard";

const RecruitCardList = [
  {
    id: 1,
    title: "유니온 1기",
    description: "프론트엔드",
  },
  {
    id: 2,
    title: "유니온 2기",
    description: "백엔드",
  },
];

const RecruitMain = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex text-16-regular text-gray-500">등록일 최신순</div>
      {RecruitCardList.length === 0 ? (
        <div className="flex w-full h-full items-center justify-center">
          <div className="flex text-center text-16-medium text-gray-400">
            등록된 모집이 없습니다. <br />
            모집 추가 버튼을 눌러 모집을 등록해보세요!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 w-full p-4">
          {RecruitCardList.map((recruit) => (
            <RecruitCard key={recruit.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitMain;
