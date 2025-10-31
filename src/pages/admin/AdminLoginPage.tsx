import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Button from "@/shared/components/Button";

const AdminEmailLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
              buttonText="로그인"
              onClick={() => navigate("/admin/greeting")}
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
