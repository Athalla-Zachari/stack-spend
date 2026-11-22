import test from "node:test";
import assert from "node:assert/strict";
import {
  getWeekStartMonday,
  formatWeekRangeLabel,
  formatShortWeekdayDate,
} from "./date.ts";
import { computeWeeklyDailyStats } from "./spending-stats.ts";

function makeTx(overrides) {
  return {
    id: "tx-1",
    amount: "50000",
    transactionDate: "2026-11-18",
    note: "Lunch",
    categoryName: "food",
    categoryType: "expense",
    pocketId: "p-1",
    pocketName: "BCA",
    relatedPocketId: null,
    relatedPocketName: null,
    ...overrides,
  };
}

test("getWeekStartMonday resolves Monday for Monday, mid-week, Sunday, cross-month, and cross-year dates", () => {
  assert.equal(getWeekStartMonday("2026-11-16"), "2026-11-16"); // Monday
  assert.equal(getWeekStartMonday("2026-11-19"), "2026-11-16"); // Thursday
  assert.equal(getWeekStartMonday("2026-11-22"), "2026-11-16"); // Sunday -> same week's Monday
  assert.equal(getWeekStartMonday("2026-12-02"), "2026-11-30"); // Cross-month
  assert.equal(getWeekStartMonday("2026-01-01"), "2025-12-29"); // Cross-year
});

test("formatWeekRangeLabel labels This Week, Last Week, cross-month, and cross-year clearly", () => {
  assert.equal(
    formatWeekRangeLabel("2026-11-16", "2026-11-22"),
    "This Week (16-22 Nov)",
  );
  assert.equal(
    formatWeekRangeLabel("2026-11-09", "2026-11-22"),
    "Last Week (9-15 Nov)",
  );
  assert.equal(
    formatWeekRangeLabel("2026-11-02", "2026-11-22"),
    "2-8 Nov 2026",
  );
  assert.equal(
    formatWeekRangeLabel("2026-11-30", "2026-12-10"),
    "Last Week (30 Nov - 6 Dec)",
  );
  assert.equal(
    formatWeekRangeLabel("2026-11-30", "2026-12-20"),
    "30 Nov - 6 Dec 2026",
  );
  assert.equal(
    formatWeekRangeLabel("2025-12-29", "2026-11-22"),
    "29 Dec 2025 - 4 Jan 2026",
  );
  assert.equal(formatShortWeekdayDate("2026-11-19"), "Thu, 19 Nov");
});

test("computeWeeklyDailyStats totals only pure expenses in the 7-day week and computes per-day bars", () => {
  const txs = [
    makeTx({ id: "1", transactionDate: "2026-11-16", amount: "100000" }), // Mon
    makeTx({ id: "2", transactionDate: "2026-11-19", amount: "200000" }), // Thu
    makeTx({ id: "3", transactionDate: "2026-11-19", amount: "100000" }), // Thu (total 300k)
    makeTx({
      id: "4",
      transactionDate: "2026-11-20",
      amount: "500000",
      categoryType: "income",
    }), // Income ignored
    makeTx({
      id: "5",
      transactionDate: "2026-11-20",
      amount: "250000",
      relatedPocketId: "p-2",
      relatedPocketName: "Cash",
    }), // Transfer ignored
    makeTx({ id: "6", transactionDate: "2026-11-12", amount: "200000" }), // Prev week
  ];

  const stats = computeWeeklyDailyStats(txs, "2026-11-16", "2026-11-22");

  assert.equal(stats.weekStart, "2026-11-16");
  assert.equal(stats.weekEnd, "2026-11-22");
  assert.equal(stats.totalWeekSpending, 400000);
  assert.equal(stats.prevWeekSpending, 200000);
  assert.equal(stats.txCount, 3);
  assert.equal(stats.days.length, 7);

  assert.equal(stats.days[0].shortLabel, "Mon");
  assert.equal(stats.days[0].dayNumber, "16");
  assert.equal(stats.days[0].amount, 100000);
  assert.equal(stats.days[0].sharePercent, 25);
  assert.equal(stats.days[0].count, 1);

  assert.equal(stats.days[3].shortLabel, "Thu");
  assert.equal(stats.days[3].amount, 300000);
  assert.equal(stats.days[3].sharePercent, 75);
  assert.equal(stats.days[3].heightPercent, 100);
  assert.equal(stats.days[3].isPeak, true);
  assert.equal(stats.days[3].count, 2);

  assert.equal(stats.days[6].shortLabel, "Sun");
  assert.equal(stats.days[6].isToday, true);
  assert.equal(stats.days[6].amount, 0);

  assert.equal(stats.peakDay?.dateStr, "2026-11-19");
  assert.deepEqual(stats.trend, {
    text: "100% more than last week",
    direction: "up",
  });
});

test("computeWeeklyDailyStats handles cross-month weeks and zero spending cleanly", () => {
  const crossMonthTxs = [
    makeTx({ id: "a", transactionDate: "2026-11-30", amount: "60000" }), // Mon Nov 30
    makeTx({ id: "b", transactionDate: "2026-12-03", amount: "40000" }), // Thu Dec 3
    makeTx({ id: "c", transactionDate: "2026-11-25", amount: "200000" }), // Prev week
  ];

  const stats = computeWeeklyDailyStats(
    crossMonthTxs,
    "2026-11-30",
    "2026-12-10",
  );
  assert.equal(stats.weekEnd, "2026-12-06");
  assert.equal(stats.totalWeekSpending, 100000);
  assert.equal(stats.prevWeekSpending, 200000);
  assert.equal(stats.days[0].dayNumber, "30");
  assert.equal(stats.days[3].dayNumber, "3");
  assert.deepEqual(stats.trend, {
    text: "50% less than prev week",
    direction: "down",
  });

  const emptyStats = computeWeeklyDailyStats([], "2026-11-16", "2026-11-22");
  assert.equal(emptyStats.totalWeekSpending, 0);
  assert.equal(emptyStats.peakDay, null);
  assert.deepEqual(emptyStats.trend, {
    text: "0% vs last week",
    direction: "flat",
  });
});
