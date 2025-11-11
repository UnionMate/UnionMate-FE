import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GreetingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <div className="text-2xl font-bold text-foreground text-balance">
            UnionMate에 오신 것을 환영해요!
          </div>
          <div className="text-lg text-gray-600">
            이용 목적에 맞는 로그인 방식을 선택해 주세요.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 max-w-6xl mx-auto">
          <Card
            onClick={() => navigate("/admin/login")}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-primary text-white border-0 min-h-[400px]"
          >
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-6">
                <div className="text-2xl font-bold">관리자 로그인하기</div>
                <div className="leading-relaxed text-lg text-white/90">
                  학생회 모집을 관리하고 <br /> 워크스페이스를 운영해보세요.
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center border border-white/30">
                  <ShieldCheck size={72} className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/login")}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white border border-gray-200 min-h-[400px]"
          >
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-6">
                <div className="text-2xl font-bold text-foreground">
                  지원자 로그인하기
                </div>
                <div className="leading-relaxed text-lg text-gray-600">
                  지원 현황을 확인하고 <br /> 합격 여부를 빠르게 만나보세요.
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <UserRound size={72} className="text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GreetingPage;
