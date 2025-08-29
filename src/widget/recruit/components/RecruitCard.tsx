import { EllipsisVertical } from "lucide-react";

const RecruitCard = () => {
  return (
    <div className="flex flex-col w-full h-full rounded-lg py-4 px-4 bg-white shadow-sm">
      <div className="flex flex-col h-full gap-[72px]">
        {/* Top Section */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="text-base font-bold text-gray-800">유니온 1기</div>
            <EllipsisVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500">프론트엔드</div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">지원서 연결</div>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              id="toggle"
              defaultChecked
            />
            <label
              htmlFor="toggle"
              className="block w-10 h-6 bg-primary rounded-full cursor-pointer transition-colors"
            >
              <span className="block w-4.5 h-4.5 bg-white rounded-full transform translate-x-5 translate-y-[3px] transition-transform"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitCard;
