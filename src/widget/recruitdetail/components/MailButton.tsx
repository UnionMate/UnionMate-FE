type MailButtonVariant = "evaluation" | "mail" | "pass";

interface MailButtonProps {
  variant: MailButtonVariant;
}

const MailButton = ({ variant }: MailButtonProps) => {
  if (variant === "pass") {
    return null;
  }

  if (variant === "evaluation") {
    return (
      <button
        type="button"
        className="flex h-[26px] items-center justify-center rounded-sm bg-primary px-6 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        지원자 평가하기
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        className="flex h-[26px] w-[111px] items-center justify-center rounded-sm bg-primary px-[20px] py-[5px] text-[13px] font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        메일 예약하기
      </button>
      <button
        type="button"
        className="flex h-[26px] w-[111px] items-center justify-center rounded-sm bg-primary px-[20px] py-[5px] text-[13px] font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        메일 전송하기
      </button>
    </div>
  );
};

export default MailButton;
