import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRecruitments, sendRecruitmentMail } from "@/api/recruitment";
import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailMainHeader, {
  type MailVariant,
} from "@/widget/recruitdetail/ui/RecruitDetailMainHeader";
import { useState } from "react";
import { toast } from "sonner";

const RecruitDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const parsedId = id ? Number(id) : NaN;

  const { data: recruitmentsData } = useQuery({
    queryKey: ["recruitments"],
    queryFn: getRecruitments,
  });

  const recruit = Number.isNaN(parsedId)
    ? undefined
    : recruitmentsData?.data?.find((r) => r.id === parsedId);

  const title = recruit?.name ?? "모집";
  const description = "";

  const [activeTab, setActiveTab] = useState<"서류 심사" | "면접">("서류 심사");
  const [documentCount, setDocumentCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [documentMailReady, setDocumentMailReady] = useState(false);
  const [finalMailReady, setFinalMailReady] = useState(false);

  const { mutate: triggerSendMail, isPending: isMailSending } = useMutation({
    mutationFn: (variant: MailVariant) => {
      if (!Number.isFinite(parsedId)) {
        throw new Error("유효하지 않은 모집입니다.");
      }
      return sendRecruitmentMail(parsedId, { type: variant });
    },
    onSuccess: (_, variant) => {
      toast.success(
        variant === "interview"
          ? "지원자 면접 메일 발송을 시작했습니다."
          : "지원자 최종 합불 메일 발송을 시작했습니다."
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "메일 발송을 시작하지 못했습니다.";
      toast.error(message);
    },
  });

  const handleSendMail = (variant: MailVariant) => {
    if (!Number.isFinite(parsedId)) {
      toast.error("유효하지 않은 모집입니다.");
      return;
    }
    triggerSendMail(variant);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 py-6 overflow-hidden">
      <RecruitDetailHeader title={title} description={description} />
      <RecruitDetailMainHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documentCount}
        interviewCount={interviewCount}
        documentMailReady={documentMailReady}
        finalMailReady={finalMailReady}
        isSendingMail={isMailSending}
        onSendMail={handleSendMail}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RecruitDetailMain
          activeTab={activeTab}
          onDocumentStateChange={({
            count,
            canSendInterviewMail,
            allDecided,
          }) => {
            setDocumentCount(count);
            setDocumentMailReady(canSendInterviewMail);
            setFinalMailReady(allDecided);
          }}
          onInterviewStateChange={(count) => setInterviewCount(count)}
        />
      </div>
    </div>
  );
};

export default RecruitDetailPage;
