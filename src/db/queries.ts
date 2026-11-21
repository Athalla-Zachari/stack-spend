import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db, profiles, pockets, transactions, categories, debts } from "@/db";
import { requireSession } from "@/lib/auth";

let avatarColumnReady = false;
let avatarColumnPromise: Promise<void> | null = null;

// Ensure avatar_url exists on existing Turso databases without a separate migration runner.
export async function ensureAvatarColumn(): Promise<void> {
  if (avatarColumnReady) return;
  if (!avatarColumnPromise) {
    avatarColumnPromise = (async () => {
      try {
        const columns = await db.all<{ name: string }>(
          sql`PRAGMA table_info(profiles)`,
        );
        const hasAvatar = columns.some((col) => col.name === "avatar_url");
        if (!hasAvatar) {
          try {
            await db.run(sql`ALTER TABLE profiles ADD COLUMN avatar_url TEXT`);
          } catch (alterErr) {
            const msg =
              alterErr instanceof Error ? alterErr.message.toLowerCase() : "";
            if (!msg.includes("duplicate column")) {
              throw alterErr;
            }
          }
        }
        avatarColumnReady = true;
      } catch (err) {
        avatarColumnPromise = null;
        throw err;
      }
    })();
  }
  return avatarColumnPromise;
}

export interface UserProfileSummary {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export const getUserProfile = cache(async (): Promise<UserProfileSummary> => {
  const session = await requireSession();
  await ensureAvatarColumn();

  const row = await db
    .select({
      id: profiles.id,
      displayName: profiles.displayName,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, session.id))
    .get();

  return (
    row ?? {
      id: session.id,
      displayName: session.displayName,
      email: session.email,
      avatarUrl: null,
    }
  );
});

export const getUserPockets = cache(async () => {
  const session = await requireSession();
  return db
    .select()
    .from(pockets)
    .where(eq(pockets.userId, session.id));
});

async function getCachedCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return db.select().from(categories);
}

export const getCategories = cache(async () => {
  await requireSession();
  return getCachedCategories();
});

export const getUserDebts = cache(async () => {
  const session = await requireSession();
  return db
    .select()
    .from(debts)
    .where(eq(debts.userId, session.id))
    .orderBy(desc(debts.dueDate), desc(debts.id));
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
