import {
  activateRecruitment,
  deleteRecruitment,
  type ActivateRecruitmentResponse,
  type DeleteRecruitmentResponse,
} from "@/features/recruitment/api/recruitment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BaseOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export const useActivateRecruitmentMutation = (
  recruitmentId: number,
  options?: BaseOptions<ActivateRecruitmentResponse>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activateRecruitment(recruitmentId, { active: true }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      options?.onSuccess?.(response);
    },
    onError: (error) => {
      console.error("모집 게시 실패:", error);
      options?.onError?.(error);
    },
  });
};

export const useDeleteRecruitmentMutation = (
  recruitmentId: number,
  options?: BaseOptions<DeleteRecruitmentResponse>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteRecruitment(recruitmentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      options?.onSuccess?.(response);
    },
    onError: (error) => {
      console.error("모집 삭제 실패:", error);
      options?.onError?.(error);
    },
  });
};
