import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecruitments } from "@/api/recruitment";
import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailMainHeader from "@/widget/recruitdetail/ui/RecruitDetailMainHeader";
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
  const [isMailReady, setIsMailReady] = useState(false);

  const handleSendMail = () => {
    toast.success("지원자 최종 합불 메일 발송을 시작했습니다.");
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 py-6 overflow-hidden">
      <RecruitDetailHeader title={title} description={description} />
      <RecruitDetailMainHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documentCount}
        interviewCount={interviewCount}
        mailReady={isMailReady}
        onSendMail={handleSendMail}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RecruitDetailMain
          activeTab={activeTab}
          onDocumentStateChange={(count, allDecided) => {
            setDocumentCount(count);
            setIsMailReady(allDecided);
          }}
          onInterviewStateChange={(count) => setInterviewCount(count)}
        />
      </div>
    </div>
  );
};

export default RecruitDetailPage;
