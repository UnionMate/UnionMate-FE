import { useNavigate } from "react-router-dom";
import Button from "../../shared/components/Button";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/greeting");
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#EBF3FF] via-white to-white px-6 py-16">
      {/* 좌측 상단 빛 */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      {/* 우측 하단 빛 */}
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-[150px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-16 text-center lg:flex-row lg:text-left">
        <div className="flex flex-col gap-10">
          {/* 로고와 브랜드명 */}
          <div className="flex items-center justify-center gap-4 lg:justify-start">
            <div className="text-5xl text-primary font-extrabold tracking-[0.08em] text-black-100 lg:text-6xl">
              UnionMate
            </div>
          </div>

          {/* 슬로건 */}
          <div className="space-y-6">
            <div className="text-3xl font-bold leading-snug tracking-tight text-black-100 lg:text-[40px]">
              당신이 찾던 학생회 모집 올인원 솔루션
            </div>
            <p className="text-lg leading-relaxed text-black-80 lg:text-xl">
              기획서 작성부터 지원자 관리까지, 한 번의 클릭으로 시작하세요.
              지원서 양식 제작, 평가, 메일 발송까지 UnionMate가 함께합니다.
            </p>
          </div>

          {/* 하이라이트 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 bg-white/70 p-6 text-left shadow-lg shadow-primary/10 backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-widest text-primary/80">
                Form Builder
              </div>
              <div className="mt-2 text-xl font-semibold text-black-100">
                드래그 앤 드롭 지원서 양식 제작
              </div>
              <p className="mt-3 text-sm leading-6 text-black-60">
                질문 유형, 조건부 항목, 파일 업로드 등을 손쉽게 구성해 이상적인
                지원서를 완성하세요.
              </p>
            </div>
            <div className="rounded-2xl border border-secondary/10 bg-white/70 p-6 text-left shadow-lg shadow-secondary/10 backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-widest text-secondary/80">
                Evaluation
              </div>
              <div className="mt-2 text-xl font-semibold text-black-100">
                팀을 위한 평가 워크스페이스
              </div>
              <p className="mt-3 text-sm leading-6 text-black-60">
                심사 기준 공유부터 평가 점수, 코멘트 정리까지 실시간으로
                협업하세요.
              </p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="mt-4 w-full max-w-xs lg:max-w-sm">
            <Button buttonText="무료로 시작하기" onClick={handleStartClick} />
          </div>
        </div>

        {/* 우측 카드 */}
        <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/50 bg-white/80 p-10 shadow-xl shadow-primary/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary/70">
              Recruitment Dashboard
            </span>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-primary/10 p-4">
                <div className="text-sm font-medium text-primary">
                  지원서 양식 제작
                </div>
                <div className="mt-2 text-xs text-black-60">
                  브랜드 톤과 모집 목적에 맞춘 템플릿과 질문 구성을 빠르게
                  적용하세요.
                </div>
              </div>
              <div className="rounded-2xl border border-black-10/20 bg-white p-4 shadow-inner">
                <div className="text-sm font-medium text-black-100">
                  지원서 평가
                </div>
                <div className="mt-2 text-xs text-black-60">
                  평가자별 점수, 태그, 메모를 실시간으로 집계하고 비교할 수
                  있습니다.
                </div>
              </div>
              <div className="rounded-2xl border border-black-10/20 bg-white p-4 shadow-inner">
                <div className="text-sm font-medium text-black-80">
                  메일 발송
                </div>
                <div className="mt-2 text-xs text-black-60">
                  합격 안내부터 일정 공지까지, 개인화된 메일을 대량 발송하고
                  추적하세요.
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-black-60">
            UnionMate와 함께라면, 학생회 운영에 집중하면서도 더 많은 지원자를
            만나고, 더 빠르게 의사결정을 내릴 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
