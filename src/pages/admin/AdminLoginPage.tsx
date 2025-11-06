import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Button from "@/shared/components/Button";
import { useManagerLogin } from "@/api/auth";

const AdminEmailLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useManagerLogin();

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-6">로그인</div>
          <div className="text-gray-600 text-2xl mb-6">
            관리자 계정으로 로그인하세요
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="학교 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary transition-colors duration-200"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary transition-colors duration-200"
            />
          </div>

          <div className="flex justify-center">
            <Button
              buttonText={isPending ? "로그인 중..." : "로그인"}
              onClick={() => {
                login(
                  { email, password },
                  {
                    onSuccess: (response) => {
                      // councilId가 있고 0이 아니면 해당 학생회 모집 페이지로 이동
                      if (
                        response.data.councilId &&
                        response.data.councilId !== 0
                      ) {
                        navigate(`/${response.data.councilId}/recruit`);
                      } else {
                        // councilId가 없으면 학생회 생성 페이지로 이동
                        navigate("/admin/greeting");
                      }
                    },
                    onError: (error) => {
                      console.error("로그인 실패:", error);
                      alert(
                        "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
                      );
                    },
                  }
                );
              }}
              disabled={isPending || !email || !password}
            />
          </div>

          <div className="text-center">
            <span className="text-gray-600 text-lg">
              관리자 계정이 없으신가요? {""}
              <button
                onClick={() => navigate("/admin/register")}
                className="text-primary font-semibold hover:underline transition-colors duration-200"
              >
                회원가입
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailLoginPage;
