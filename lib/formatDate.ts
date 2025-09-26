// lib/formatDate.ts
export function formatDate(
  input?: string | number | Date,
  opts?: {
    locale?: string;
    dateStyle?: "short" | "medium" | "long" | "full";
    timeStyle?: "short" | "medium" | "long";
  },
) {
  if (!input) return "";

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const { locale = "en-GB", dateStyle = "medium", timeStyle } = opts || {};

  try {
    if (timeStyle) {
      return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(
        date,
      );
    }
    return new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
  } catch (_err) {
    // fallback
    return date.toLocaleDateString();
  }
}
