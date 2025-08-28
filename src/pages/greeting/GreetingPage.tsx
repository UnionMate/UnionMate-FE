import { Card, CardContent } from "@/components/ui/card";
import { Key, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GreetingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground text-balance">
            UnionMate에서 다양한 서비스를 경험해보세요.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* 동아리 생성 */}
          <Card
            onClick={() => navigate("/createclub")}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-primary text-white border-0 min-h-[400px]"
          >
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-6">
                <div className="text-2xl font-bold">동아리 생성</div>
                <div className="leading-relaxed text-lg">
                  워크스페이스를 생성하고 <br /> 동아리 관리를 시작해보세요!
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center">
                  <Users size={100} className="text-white" />
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
                <div className="leading-relaxed text-lg">
                  초대 코드를 통해 <br /> 빠르게 관리를 시작해보세요!
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                  <Key size={100} className="text-gray-600" />
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
