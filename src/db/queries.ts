import { cache } from "react";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db, pockets, transactions, categories } from "@/db";
import { requireSession } from "@/lib/auth";

export const getUserPockets = cache(async () => {
  const session = await requireSession();
  return db
    .select()
    .from(pockets)
    .where(eq(pockets.userId, session.id));
});

export const getCategories = cache(async () => {
  await requireSession();
  return db.select().from(categories);
});

export interface TransactionWithDetails {
  id: string;
  amount: string;
  transactionDate: string;
  note: string | null;
  categoryName: string;
  categoryType: "income" | "expense";
  pocketId: string;
  pocketName: string;
  relatedPocketId: string | null;
  relatedPocketName: string | null;
}

export const getUserTransactions = cache(async (): Promise<TransactionWithDetails[]> => {
  const session = await requireSession();
  const relatedPockets = alias(pockets, "related_pockets");

  const rawTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      transactionDate: transactions.transactionDate,
      note: transactions.note,
      categoryName: categories.name,
      categoryType: categories.type,
      pocketId: pockets.id,
      pocketName: pockets.name,
      relatedPocketId: relatedPockets.id,
      relatedPocketName: relatedPockets.name,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .innerJoin(pockets, eq(transactions.pocketId, pockets.id))
    .leftJoin(relatedPockets, eq(transactions.relatedPocketId, relatedPockets.id))
    .where(eq(transactions.userId, session.id))
    .orderBy(
      desc(transactions.transactionDate),
      sql`"transactions"."rowid" DESC`
    );

  const transactionsList: TransactionWithDetails[] = [];

  for (const tx of rawTransactions) {
    if (tx.relatedPocketId && tx.relatedPocketName) {
      // 1. Entry expense untuk pocket sumber (outflow)
      transactionsList.push({
        id: `${tx.id}-out`,
        amount: tx.amount,
        transactionDate: tx.transactionDate,
        note: tx.note,
        categoryName: tx.categoryName,
        categoryType: "expense",
        pocketId: tx.pocketId,
        pocketName: tx.pocketName,
        relatedPocketId: tx.relatedPocketId,
        relatedPocketName: tx.relatedPocketName,
      });

      // 2. Entry income untuk pocket tujuan (inflow)
      transactionsList.push({
        id: `${tx.id}-in`,
        amount: tx.amount,
        transactionDate: tx.transactionDate,
        note: tx.note,
        categoryName: tx.categoryName,
        categoryType: "income",
        pocketId: tx.relatedPocketId,
        pocketName: tx.relatedPocketName,
        relatedPocketId: tx.pocketId,
        relatedPocketName: tx.pocketName,
      });
    } else {
      transactionsList.push({
        ...tx,
        categoryType: tx.categoryType as "income" | "expense",
      });
    }
  }

  return transactionsList;
});
