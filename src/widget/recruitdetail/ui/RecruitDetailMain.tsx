import DetailMainCard from "../components/DetailMainCard";

const DetailMainCardList = [
  {
    name: "세마리",
    phone: "010-5655-5555",
    email: "546484654@gmail.com",
    date: "2024-02-06",
    status: "FAIL",
  },
  {
    name: "김철수",
    phone: "010-1234-5678",
    email: "kimchulsoo@example.com",
    date: "2024-02-07",
    status: "PASS",
  },
  {
    name: "박영희",
    phone: "010-9876-5432",
    email: "parkyounghee@example.com",
    date: "2024-02-08",
    status: "FAIL",
  },
  {
    name: "이민수",
    phone: "010-1111-2222",
    email: "leeminsu@example.com",
    date: "2024-02-09",
    status: "PASS",
  },
  {
    name: "최지영",
    phone: "010-3333-4444",
    email: "choijiyeong@example.com",
    date: "2024-02-10",
    status: "FAIL",
  },
  {
    name: "정현우",
    phone: "010-5555-6666",
    email: "junghyunwoo@example.com",
    date: "2024-02-11",
    status: "PASS",
  },
  {
    name: "한소영",
    phone: "010-7777-8888",
    email: "hansoyoung@example.com",
    date: "2024-02-12",
    status: "FAIL",
  },
  {
    name: "송태호",
    phone: "010-9999-0000",
    email: "songtaeho@example.com",
    date: "2024-02-13",
    status: "PASS",
  },
  {
    name: "윤서진",
    phone: "010-1212-3434",
    email: "yoonseojin@example.com",
    date: "2024-02-14",
    status: "FAIL",
  },
  {
    name: "강동원",
    phone: "010-5656-7878",
    email: "kangdongwon@example.com",
    date: "2024-02-15",
    status: "PASS",
  },
  {
    name: "임수진",
    phone: "010-9090-1212",
    email: "limsujin@example.com",
    date: "2024-02-16",
    status: "FAIL",
  },
  {
    name: "오승준",
    phone: "010-3434-5656",
    email: "oseungjun@example.com",
    date: "2024-02-17",
    status: "PASS",
  },
];

const RecruitDetailMain = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2.5 pb-6">
        {DetailMainCardList.map((item, index) => (
          <DetailMainCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default RecruitDetailMain;
