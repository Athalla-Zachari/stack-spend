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

export const getUserTransactions = cache(async () => {
  const session = await requireSession();
  const relatedPockets = alias(pockets, "related_pockets");

  return db
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
});

export type TransactionWithDetails = Awaited<
  ReturnType<typeof getUserTransactions>
>[number];
