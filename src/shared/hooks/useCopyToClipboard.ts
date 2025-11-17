import { useCallback, useEffect, useRef, useState } from "react";

type CopyResult = {
  message: string;
  tone: "success" | "error";
};

const fallbackCopy = (text: string) => {
  if (typeof document === "undefined") {
    throw new Error("클립보드 복사가 지원되지 않습니다.");
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!succeeded) {
    throw new Error("문자열 복사에 실패했습니다.");
  }
};

const copyText = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  fallbackCopy(text);
};

export const useCopyToClipboard = (duration = 2500) => {
  const [result, setResult] = useState<CopyResult | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = null;
    setResult(null);
  }, []);

  useEffect(() => reset, [reset]);

  const copy = useCallback(
    async (text: string, messages?: Partial<CopyResult>) => {
      try {
        await copyText(text);
        setResult({
          message: messages?.message ?? "링크가 복사되었습니다.",
          tone: messages?.tone ?? "success",
        });
      } catch (error) {
        console.error("클립보드 복사 실패:", error);
        setResult({
          message:
            messages?.message ??
            "복사 중 오류가 발생했습니다. 다시 시도해 주세요.",
          tone: messages?.tone ?? "error",
        });
      } finally {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
          setResult(null);
          timeoutId.current = null;
        }, duration);
      }
    },
    [duration]
  );

  return { copy, result, reset };
};

export type UseCopyToClipboardReturn = ReturnType<typeof useCopyToClipboard>;
