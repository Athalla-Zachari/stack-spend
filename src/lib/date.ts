const JAKARTA_TIMEZONE = "Asia/Jakarta";

const WEEKDAY_SHORT_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getJakartaDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): {
  year: number;
  monthIndex: number;
  day: number;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, monthIndex, day));

  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== monthIndex ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

export function shiftDateString(dateStr: string, deltaDays: number): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;

  // Use UTC calendar math so browser local timezones never shift YYYY-MM-DD by a day.
  const dt = new Date(
    Date.UTC(parsed.year, parsed.monthIndex, parsed.day + deltaDays),
  );
  const year = dt.getUTCFullYear();
  const month = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function formatShortDate(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;

  const shortMonth = MONTH_NAMES[parsed.monthIndex].slice(0, 3);
  return `${parsed.day} ${shortMonth} ${parsed.year}`;
}

export function formatDisplayDate(dateStr: string, todayStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;

  const shortMonth = MONTH_NAMES[parsed.monthIndex].slice(0, 3);
  if (dateStr === todayStr) {
    return `Today, ${parsed.day} ${shortMonth}`;
  }
  if (dateStr === shiftDateString(todayStr, -1)) {
    return `Yesterday, ${parsed.day} ${shortMonth}`;
  }
  return `${parsed.day} ${shortMonth} ${parsed.year}`;
}

export function getWeekStartMonday(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;

  const dt = new Date(Date.UTC(parsed.year, parsed.monthIndex, parsed.day));
  const mondayOffset = (dt.getUTCDay() + 6) % 7;
  return shiftDateString(dateStr, -mondayOffset);
}

export function formatShortWeekdayDate(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;

  const dt = new Date(Date.UTC(parsed.year, parsed.monthIndex, parsed.day));
  const weekday = WEEKDAY_SHORT_NAMES[dt.getUTCDay()];
  const shortMonth = MONTH_NAMES[parsed.monthIndex].slice(0, 3);
  return `${weekday}, ${parsed.day} ${shortMonth}`;
}

export function formatCompactWeekRange(weekStartStr: string): string {
  const normalizedStart = getWeekStartMonday(weekStartStr);
  const start = parseDateString(normalizedStart);
  const end = parseDateString(shiftDateString(normalizedStart, 6));
  if (!start || !end) return weekStartStr;

  const startMonth = MONTH_NAMES[start.monthIndex].slice(0, 3);
  const endMonth = MONTH_NAMES[end.monthIndex].slice(0, 3);

  if (start.year !== end.year) {
    return `${start.day} ${startMonth} ${start.year} - ${end.day} ${endMonth} ${end.year}`;
  }
  if (start.monthIndex === end.monthIndex) {
    return `${start.day}-${end.day} ${endMonth}`;
  }
  return `${start.day} ${startMonth} - ${end.day} ${endMonth}`;
}

export function formatWeekRangeLabel(
  weekStartStr: string,
  todayStr: string,
): string {
  const normalizedStart = getWeekStartMonday(weekStartStr);
  const currentWeekStart = getWeekStartMonday(todayStr);
  const lastWeekStart = shiftDateString(currentWeekStart, -7);

  const start = parseDateString(normalizedStart);
  const end = parseDateString(shiftDateString(normalizedStart, 6));
  if (!start || !end) return weekStartStr;

  const compactRange = formatCompactWeekRange(normalizedStart);
  if (normalizedStart === currentWeekStart) {
    return `This Week (${compactRange})`;
  }
  if (normalizedStart === lastWeekStart) {
    return `Last Week (${compactRange})`;
  }

  if (start.year !== end.year) {
    return compactRange;
  }
  return `${compactRange} ${end.year}`;
}
