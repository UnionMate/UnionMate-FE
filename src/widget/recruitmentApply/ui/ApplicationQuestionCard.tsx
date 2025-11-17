import clsx from "clsx";
import type { ChangeEvent } from "react";
import type {
  RecruitmentDetailItem,
  RecruitmentItemOption,
} from "@/features/recruitment/api/recruitment";

type ApplicationQuestionCardProps = {
  item: RecruitmentDetailItem;
  value: string | string[] | undefined;
  onTextChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSelectChange: (optionKey: string, multiple: boolean) => void;
};

const getOptionKey = (option: RecruitmentItemOption) =>
  String(option.id ?? `order-${option.order}`);

const ApplicationQuestionCard = ({
  item,
  value,
  onTextChange,
  onDateChange,
  onSelectChange,
}: ApplicationQuestionCardProps) => {
  if (item.type === "ANNOUNCEMENT") {
    return (
      <article className="rounded-3xl border border-black-10 bg-black-5/70 px-6 py-4 text-left">
        <h3 className="text-title-16-semibold text-black-90">{item.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-15-regular text-black-60">
          {item.description}
        </p>
      </article>
    );
  }

  if (item.type === "SELECT") {
    const selectedKeys = Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];
    const isMultiple = Boolean(item.multiple);

    return (
      <article className="rounded-3xl border border-primary/15 bg-white px-6 py-5 shadow-[0px_12px_24px_rgba(0,0,0,0.04)]">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-title-16-semibold text-black-90">
              <span>{item.title}</span>
              {item.required && <span className="text-error">*</span>}
            </div>
            {item.description && (
              <p className="text-14-regular text-black-50">{item.description}</p>
            )}
          </div>
          <span className="rounded-full bg-black-5 px-3 py-1 text-12-semibold text-black-60">
            {isMultiple ? "복수 선택" : "단일 선택"}
          </span>
        </header>
        <div className="mt-5 flex flex-col gap-3">
          {item.options?.map((option) => {
            const optionKey = getOptionKey(option);
            const isChecked = isMultiple
              ? selectedKeys.includes(optionKey)
              : selectedKeys[0] === optionKey;
            return (
              <label
                key={optionKey}
                className={clsx(
                  "flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition",
                  isChecked
                    ? "border-primary bg-primary/5"
                    : "border-black-10 bg-white hover:border-primary/30"
                )}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  checked={isChecked}
                  onChange={() => onSelectChange(optionKey, isMultiple)}
                  className="h-4 w-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-15-medium text-black-80">
                    {option.title || "선택지"}
                  </span>
                  {option.isEtc && option.etcTitle && (
                    <span className="text-13-regular text-black-45">
                      {option.etcTitle}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </article>
    );
  }

  if (item.type === "CALENDAR") {
    return (
      <article className="rounded-3xl border border-primary/15 bg-white px-6 py-5 shadow-[0px_12px_24px_rgba(0,0,0,0.04)]">
        <header className="space-y-2">
          <div className="flex items-center gap-1 text-title-16-semibold text-black-90">
            <span>{item.title}</span>
            {item.required && <span className="text-error">*</span>}
          </div>
          {item.description && (
            <p className="text-14-regular text-black-50">{item.description}</p>
          )}
        </header>
        <input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onDateChange(event.target.value)}
          className="mt-4 w-full rounded-2xl border border-black-15 px-4 py-3 text-15-medium text-black-80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </article>
    );
  }

  const isLongAnswer = item.type === "TEXT" && (item.maxLength ?? 255) > 255;
  const InputComponent = isLongAnswer ? "textarea" : "input";

  return (
    <article className="rounded-3xl border border-primary/15 bg-white px-6 py-5 shadow-[0px_12px_24px_rgba(0,0,0,0.04)]">
      <header className="space-y-2">
        <div className="flex items-center gap-1 text-title-16-semibold text-black-90">
          <span>{item.title}</span>
          {item.required && <span className="text-error">*</span>}
        </div>
        {item.description && (
          <p className="text-14-regular text-black-50">{item.description}</p>
        )}
      </header>
      <InputComponent
        value={typeof value === "string" ? value : ""}
        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onTextChange(event.target.value)
        }
        placeholder="답변을 입력해주세요."
        maxLength={item.maxLength ?? (isLongAnswer ? 1000 : 255)}
        className={clsx(
          "mt-4 w-full rounded-2xl border border-black-15 px-4 py-3 text-15-medium text-black-80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          isLongAnswer && "min-h-[160px] resize-none"
        )}
      />
    </article>
  );
};

export default ApplicationQuestionCard;
