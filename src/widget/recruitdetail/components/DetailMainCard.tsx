interface DetailMainCardProps {
  item: {
    name: string;
    phone: string;
    email: string;
    date: string;
    status: string;
  };
}

const DetailMainCard = ({ item }: DetailMainCardProps) => {
  return (
    <div className="flex bg-white h-[60px] items-center py-5.5 px-10 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between w-full">
        {/* 이름 */}
        <div className="flex-1 text-left">
          <span className="text-gray-900 font-medium">{item.name}</span>
        </div>

        {/* 전화번호 */}
        <div className="flex-[2] text-center">
          <span className="text-gray-700">{item.phone}</span>
        </div>

        {/* 이메일 */}
        <div className="flex-[3] text-center">
          <span className="text-gray-700">{item.email}</span>
        </div>

        {/* 날짜 */}
        <div className="flex-1 text-center">
          <span className="text-gray-700">{item.date}</span>
        </div>

        {/* 상태 */}
        <div className="flex-1 text-right">
          <span
            className={`font-medium ${
              item.status === "PASS" ? "text-blue-500" : "text-red-500"
            }`}
          >
            {item.status === "PASS" ? "합격" : "불합격"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailMainCard;
