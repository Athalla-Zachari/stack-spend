import type { TransactionWithDetails } from "@/db/queries";

export interface DayBarItem {
  dateStr: string;
  shortLabel: string;
  fullLabel: string;
  dayNumber: string;
  amount: number;
  heightPercent: number;
  sharePercent: number;
  count: number;
  isPeak: boolean;
  isToday: boolean;
}

export interface WeeklyTrend {
  text: string;
  direction: "up" | "down" | "flat";
}

export interface WeeklyDailyStats {
  weekStart: string;
  weekEnd: string;
  totalWeekSpending: number;
  prevWeekSpending: number;
  txCount: number;
  days: DayBarItem[];
  peakDay: DayBarItem | null;
  trend: WeeklyTrend;
}

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseYmd(dateStr: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
}

function formatUtcYmd(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftUtcYmd(dateStr: string, deltaDays: number): string {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr;
  return formatUtcYmd(
    new Date(Date.UTC(parsed[0], parsed[1], parsed[2] + deltaDays)),
  );
}

function normalizeMonday(dateStr: string): string {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr;
  const dt = new Date(Date.UTC(parsed[0], parsed[1], parsed[2]));
  const mondayOffset = (dt.getUTCDay() + 6) % 7;
  return shiftUtcYmd(dateStr, -mondayOffset);
}

function computeWeeklyTrend(
  currentTotal: number,
  previousTotal: number,
  targetLabel: string,
): WeeklyTrend {
  if (previousTotal === 0 && currentTotal === 0) {
    return { text: `0% vs ${targetLabel}`, direction: "flat" };
  }
  if (previousTotal === 0) {
    return { text: `100% more than ${targetLabel}`, direction: "up" };
  }
  if (currentTotal === 0) {
    return { text: `100% less than ${targetLabel}`, direction: "down" };
  }
  if (currentTotal === previousTotal) {
    return { text: `0% vs ${targetLabel}`, direction: "flat" };
  }

  const diff = Math.abs(currentTotal - previousTotal);
  const formatted = ((diff / previousTotal) * 100)
    .toFixed(1)
    .replace(/\.0$/, "");

  if (currentTotal > previousTotal) {
    return { text: `${formatted}% more than ${targetLabel}`, direction: "up" };
  }
  return { text: `${formatted}% less than ${targetLabel}`, direction: "down" };
}

export function computeWeeklyDailyStats(
  transactions: TransactionWithDetails[],
  weekStartStr: string,
  todayStr?: string,
): WeeklyDailyStats {
  const weekStart = normalizeMonday(weekStartStr);
  const weekEnd = shiftUtcYmd(weekStart, 6);
  const prevWeekStart = shiftUtcYmd(weekStart, -7);
  const prevWeekEnd = shiftUtcYmd(weekStart, -1);

  const dayDates = Array.from({ length: 7 }, (_, i) =>
    shiftUtcYmd(weekStart, i),
  );
  const dateIndexMap = new Map<string, number>(
    dayDates.map((dateStr, idx) => [dateStr, idx]),
  );

  const dayAmounts = new Array<number>(7).fill(0);
  const dayCounts = new Array<number>(7).fill(0);

  let totalWeekSpending = 0;
  let prevWeekSpending = 0;
  let txCount = 0;

  for (const tx of transactions) {
    if (tx.categoryType !== "expense" || tx.relatedPocketId) continue;

    const amount = Number(tx.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const dayIdx = dateIndexMap.get(tx.transactionDate);
    if (dayIdx !== undefined) {
      dayAmounts[dayIdx] += amount;
      dayCounts[dayIdx] += 1;
      totalWeekSpending += amount;
      txCount += 1;
    } else if (
      tx.transactionDate >= prevWeekStart &&
      tx.transactionDate <= prevWeekEnd
    ) {
      prevWeekSpending += amount;
    }
  }

  const maxDayAmount = Math.max(0, ...dayAmounts);

  const days: DayBarItem[] = dayDates.map((dateStr, idx) => {
    const parsed = parseYmd(dateStr);
    const dayNum = parsed ? parsed[2] : idx + 1;
    const shortMonth = parsed ? MONTH_SHORT[parsed[1]] : "";
    const shortLabel = WEEKDAY_SHORT[idx];
    const amount = dayAmounts[idx];
    const isPeak = maxDayAmount > 0 && amount === maxDayAmount;
    const heightPercent =
      maxDayAmount > 0 ? Math.round((amount / maxDayAmount) * 100) : 0;
    const sharePercent =
      totalWeekSpending > 0
        ? Math.round((amount / totalWeekSpending) * 100)
        : 0;

    return {
      dateStr,
      shortLabel,
      fullLabel: `${shortLabel}, ${dayNum} ${shortMonth}`,
      dayNumber: String(dayNum),
      amount,
      heightPercent,
      sharePercent,
      count: dayCounts[idx],
      isPeak,
      isToday: Boolean(todayStr && dateStr === todayStr),
    };
  });

  const peakDay = days.find((d) => d.isPeak) ?? null;
  const isCurrentWeek = Boolean(
    todayStr && weekStart === normalizeMonday(todayStr),
  );
  const trend = computeWeeklyTrend(
    totalWeekSpending,
    prevWeekSpending,
    isCurrentWeek ? "last week" : "prev week",
  );

  return {
    weekStart,
    weekEnd,
    totalWeekSpending,
    prevWeekSpending,
    txCount,
    days,
    peakDay,
    trend,
  };
}
