const DISPLAY_LOCALE = "en-US";
const DISPLAY_TIME_ZONE = "UTC";

export function formatDateTime(value: Date, style: "short" | "full" = "short"): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    dateStyle: style === "full" ? "full" : "medium",
    timeStyle: "short",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(value);
}

export function formatDateLabel(
  value?: string | Date | null,
  month: "short" | "long" = "short",
): string | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(parsed)) {
    return typeof value === "string" ? value : null;
  }

  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month,
    day: "numeric",
    year: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(parsed));
}

export function formatRelativeTime(date: Date, nowMs: number = Date.now()): string {
  const diffMs = nowMs - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `edited ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `edited ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `edited ${days} ${days === 1 ? "day" : "days"} ago`;
  }

  return `edited ${new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(date)}`;
}
