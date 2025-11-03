import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/components/Button";
import { useManagerRegister } from "@/api/auth";

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate, isPending } = useManagerRegister();

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("모든 정보를 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setErrorMessage("");

    mutate(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          navigate("/admin/greeting");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "회원가입에 실패했습니다.";
          setErrorMessage(message);
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen p-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-gray-900">
            관리자 회원가입
          </div>
          <div className="text-gray-600 text-lg">
            학교 이메일로 관리자 계정을 만들어보세요.
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="홍길동"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              학교 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@university.ac.kr"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="영문, 숫자 포함 8자 이상"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-500 text-center">{errorMessage}</div>
        )}

        <div className="flex flex-col items-center space-y-4 pt-2">
          <Button
            buttonText={isPending ? "처리 중..." : "회원가입"}
            onClick={handleRegister}
          />
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="text-primary font-semibold hover:underline transition-colors duration-200"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
