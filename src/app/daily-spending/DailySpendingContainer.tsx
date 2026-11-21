"use client";

import { useState, useMemo } from "react";
import type { TransactionWithDetails } from "@/db/queries";
import { PeriodNavigator } from "@/components/ui/period-navigator";
import { DailySpendingCard } from "@/components/DailySpendingCard";
import { TransactionList } from "@/components/TransactionList";
import {
  formatDisplayDate,
  formatShortDate,
  parseDateString,
  shiftDateString,
} from "@/lib/date";
import SpendingChart from "./SpendingChart";

interface DailySpendingContainerProps {
  transactions: TransactionWithDetails[];
  initialDate: string;
}

export default function DailySpendingContainer({
  transactions,
  initialDate,
}: DailySpendingContainerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const isToday = selectedDate === initialDate;

  const dayTransactions = useMemo(
    () => transactions.filter((tx) => tx.transactionDate === selectedDate),
    [transactions, selectedDate],
  );

  const formattedSelectedDate = formatShortDate(selectedDate);

  return (
    <div className="w-full flex flex-col gap-4">
      <PeriodNavigator
        label={formatDisplayDate(selectedDate, initialDate)}
        prevLabel="Previous Day"
        nextLabel="Next Day"
        onPrev={() => setSelectedDate((prev) => shiftDateString(prev, -1))}
        onNext={() =>
          setSelectedDate((prev) => {
            const next = shiftDateString(prev, 1);
            return next > initialDate ? initialDate : next;
          })
        }
        nextDisabled={selectedDate >= initialDate}
      >
        <input
          type="date"
          aria-label="Select Date"
          value={selectedDate}
          max={initialDate}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.();
            } catch {
              // Browsers without showPicker support open on focus or native tap.
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            if (!value || !parseDateString(value)) return;
            setSelectedDate(value > initialDate ? initialDate : value);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
        />
      </PeriodNavigator>

      <DailySpendingCard
        transactions={transactions}
        selectedDate={selectedDate}
        todayStr={initialDate}
      />

      <SpendingChart
        transactions={transactions}
        selectedDate={selectedDate}
        todayStr={initialDate}
      />

      <TransactionList
        transactions={dayTransactions}
        limit={0}
        showHeader={true}
        headerTitle={isToday ? "Today's Transactions" : "Day's Transactions"}
        showEntryLength={true}
        emptyTitle={
          isToday
            ? "No Transactions Today"
            : `No Transactions on ${formattedSelectedDate}`
        }
        emptyMessage={
          isToday
            ? "No spending or income recorded for today yet."
            : `No spending or income recorded for ${formattedSelectedDate}.`
        }
      />
    </div>
  );
}
