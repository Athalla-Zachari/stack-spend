import { sql } from "drizzle-orm";
import { sqliteTable, text, numeric } from "drizzle-orm/sqlite-core";

// 1. Profiles (User Accounts)
export const profiles = sqliteTable("profiles", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	displayName: text("display_name").notNull(),
	email: text("email").notNull(),
	passwordHash: text("password_hash").notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// 2. Pockets (Wallets / Accounts)
export const pockets = sqliteTable("pockets", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	balance: numeric("balance").notNull().default("0.00"),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// 3. Categories
export const categories = sqliteTable("categories", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull().unique(),
	type: text("type", { enum: ["income", "expense"] }).notNull(),
	description: text("description"),
});

// 4. Debts
export const debts = sqliteTable("debts", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	creditorName: text("creditor_name").notNull(),
	totalAmount: numeric("total_amount").notNull().default("0.00"),
	paidAmount: numeric("paid_amount").notNull().default("0.00"),
	dueDate: text("due_date"),
	status: text("status", { enum: ["unpaid", "partial", "paid"] })
		.notNull()
		.default("unpaid"),
});

// 5. Transactions
export const transactions = sqliteTable("transactions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	pocketId: text("pocket_id")
		.notNull()
		.references(() => pockets.id, { onDelete: "restrict" }),
	relatedPocketId: text("related_pocket_id").references(() => pockets.id, {
		onDelete: "set null",
	}),
	categoryId: text("category_id")
		.notNull()
		.references(() => categories.id, { onDelete: "restrict" }),
	amount: numeric("amount").notNull(),
	transactionDate: text("transaction_date")
		.notNull()
		.default(sql`(CURRENT_DATE)`),
	note: text("note"),
});

// Type definitions
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Pocket = typeof pockets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Debt = typeof debts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

