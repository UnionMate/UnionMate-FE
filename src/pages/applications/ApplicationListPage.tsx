import { useNavigate } from "react-router-dom";

const MOCK_APPLICATIONS = [
  {
    id: 1,
    clubName: "UnionMate 운영진 모집",
    role: "기획팀",
    status: "서류 통과",
    updatedAt: "2024.06.20",
  },
  {
    id: 2,
    clubName: "모바일 프로그래밍 동아리",
    role: "iOS 파트",
    status: "합격",
    updatedAt: "2024.06.15",
  },
  {
    id: 3,
    clubName: "미디어 영상 제작 동아리",
    role: "촬영 파트",
    status: "지원 완료",
    updatedAt: "2024.06.12",
  },
];

const statusChipClass: Record<string, string> = {
  합격: "bg-green-100 text-green-600",
  "서류 통과": "bg-blue-100 text-blue-600",
  "지원 완료": "bg-gray-100 text-gray-600",
};

const ApplicationListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <div className="text-4xl font-bold text-gray-900">지원서 목록</div>
          <div className="text-gray-600 text-lg">
            내가 지원한 동아리 현황을 한눈에 확인하세요.
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_APPLICATIONS.map((application) => (
            <div
              key={application.id}
              className="border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-gray-900">
                    {application.clubName}
                  </div>
                  <div className="text-gray-600 text-base">
                    지원 파트: {application.role}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusChipClass[application.status]
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>최근 업데이트: {application.updatedAt}</span>
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => navigate(`/applications/${application.id}`)}
                >
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationListPage;
