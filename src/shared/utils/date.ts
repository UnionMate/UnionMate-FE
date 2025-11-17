const isValidDate = (value?: string) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const buildFormatter = (options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat("ko", options);
  return (value?: string) => {
    if (!isValidDate(value)) {
      return value ?? "-";
    }
    return formatter.format(new Date(value as string));
  };
};

export const formatKoreanDate = buildFormatter({
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

export const formatKoreanTime = buildFormatter({
  hour: "2-digit",
  minute: "2-digit",
});

export const formatKoreanDateTime = buildFormatter({
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});
