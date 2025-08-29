import { Search } from "lucide-react";

const RecruitDetailSearch = () => {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center w-[300px] h-10 px-4 rounded-lg bg-gray-200 text-gray-600">
        <span className="text-sm">지원자 검색하기</span>
        <Search className="w-5 h-5 ml-auto text-gray-600" />
      </div>
    </div>
  );
};

export default RecruitDetailSearch;
