import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/components/Button";
import { useManagerRegister, useVerifyManagerEmail } from "@/api/auth";

type VerificationStatus = "idle" | "success" | "failed";

type FormState = {
  name: string;
  schoolName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const createInitialFormState = (): FormState => ({
  name: "",
  schoolName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: InputFieldProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
    />
  </div>
);

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(createInitialFormState());
  const [errorMessage, setErrorMessage] = useState("");
  const [verification, setVerification] = useState<{
    state: VerificationStatus;
    message: string;
  }>({ state: "idle", message: "" });
  const [isVerified, setIsVerified] = useState(false);
  const { mutate, isPending } = useManagerRegister();
  const { mutate: verifyEmail, isPending: isVerifying } =
    useVerifyManagerEmail();

  const updateField =
    (field: keyof FormState) =>
    (value: string): void => {
      setForm((previous) => ({ ...previous, [field]: value }));
      if (field === "email" || field === "schoolName") {
        setIsVerified(false);
        setVerification({ state: "idle", message: "" });
      }
    };

  const handleValidateEmail = () => {
    const trimmedSchoolName = form.schoolName.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedSchoolName) {
      setVerification({
        state: "failed",
        message: "학교 이름을 입력해주세요.",
      });
      setIsVerified(false);
      return;
    }

    if (!trimmedEmail) {
      setVerification({
        state: "failed",
        message: "학교 이메일을 입력해주세요.",
      });
      setIsVerified(false);
      return;
    }

    verifyEmail(
      { email: trimmedEmail, univName: trimmedSchoolName },
      {
        onSuccess: (response) => {
          if (response.data?.isAuthorize) {
            setVerification({
              state: "success",
              message: "학교 인증이 완료되었습니다.",
            });
            setIsVerified(true);
          } else {
            setVerification({
              state: "failed",
              message: "학교 인증에 실패했습니다. 다시 시도해주세요.",
            });
            setIsVerified(false);
          }
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "학교 인증 요청에 실패했습니다.";
          setVerification({
            state: "failed",
            message,
          });
          setIsVerified(false);
        },
      }
    );
  };

  const handleRegister = () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("모든 정보를 입력해 주세요.");
      return;
    }

    if (!isVerified) {
      setErrorMessage("학교 이메일 유효성 검사를 완료해 주세요.");
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

  const verificationMessageClass =
    verification.state === "success" ? "text-green-600" : "text-red-500";

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
          <InputField
            label="이름"
            value={form.name}
            onChange={updateField("name")}
            placeholder="홍길동"
          />
          <InputField
            label="학교 이름"
            value={form.schoolName}
            onChange={updateField("schoolName")}
            placeholder="예: 가천대학교"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              학교 이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email")(event.target.value)}
                placeholder="name@university.ac.kr"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
              />
              <button
                type="button"
                onClick={handleValidateEmail}
                disabled={isVerifying}
                className="whitespace-nowrap rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
              >
                {isVerifying ? "검사 중..." : "학교 이메일 인증"}
              </button>
            </div>
            {verification.message && (
              <p className={`text-sm ${verificationMessageClass}`}>
                {verification.message}
              </p>
            )}
          </div>

          <InputField
            label="비밀번호"
            value={form.password}
            onChange={updateField("password")}
            placeholder="영문, 숫자 포함 8자 이상"
            type="password"
          />
          <InputField
            label="비밀번호 확인"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            placeholder="비밀번호를 다시 입력하세요"
            type="password"
          />
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
