import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminGreetingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <div className="text-2xl font-bold text-foreground text-balance">
            관리자 시작하기
          </div>
          <div className="text-lg text-gray-600">
            학생회를 새로 만들거나, 초대 코드로 바로 시작하세요.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 max-w-6xl mx-auto">
          <Card
            onClick={() => navigate("/createclub")}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-primary text-white border-0 min-h-[400px]"
          >
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-6">
                <div className="text-2xl font-bold">학생회 생성</div>
                <div className="leading-relaxed text-lg text-white/90">
                  학생회를 생성하고
                  <br /> 관리를 시작해보세요!
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
            onClick={() => navigate("/verifycode")}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white border border-gray-200 min-h-[400px]"
          >
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-6">
                <div className="text-2xl font-bold text-foreground">
                  초대 코드 입력
                </div>
                <div className="leading-relaxed text-lg text-gray-600">
                  초대 코드를 통해 <br /> 빠르게 관리를 시작해보세요!
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <Key size={72} className="text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminGreetingPage;
