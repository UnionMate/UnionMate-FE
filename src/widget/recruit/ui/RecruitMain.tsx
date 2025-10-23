import RecruitCard from "../components/RecruitCard";
import { recruitCardList } from "../constants/recruitCardList";

const RecruitMain = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex text-16-regular text-gray-500">등록일 최신순</div>
      {recruitCardList.length === 0 ? (
        <div className="flex w-full h-full items-center justify-center">
          <div className="flex text-center text-16-medium text-gray-400">
            등록된 모집이 없습니다. <br />
            모집 추가 버튼을 눌러 모집을 등록해보세요!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 w-full p-4">
          {recruitCardList.map((recruit) => (
            <RecruitCard key={recruit.id} recruit={recruit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitMain;
