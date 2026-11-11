"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, pockets, categories, transactions } from "@/db";
import { requireSession } from "@/lib/auth";

export type TransactionActionState = {
	error?: string;
	warning?: string;
	success?: boolean;
};

function getJakartaDateString(): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());

	const year = parts.find((p) => p.type === "year")?.value;
	const month = parts.find((p) => p.type === "month")?.value;
	const day = parts.find((p) => p.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

export async function createTransactionAction(
	_prevState: TransactionActionState | null,
	formData: FormData,
): Promise<TransactionActionState> {
	const session = await requireSession();

	const pocketId = formData.get("pocketId")?.toString().trim() ?? "";
	const categoryId = formData.get("categoryId")?.toString().trim() ?? "";
	const note = formData.get("note")?.toString().trim() ?? "";
	const rawAmount = formData.get("amount")?.toString().trim() ?? "";

	if (!pocketId) {
		return { error: "Silakan pilih pocket terlebih dahulu." };
	}

	if (!categoryId) {
		return { error: "Silakan pilih kategori transaksi." };
	}

	if (!note) {
		return { error: "Silakan isi catatan transaksi." };
	}

	if (!rawAmount || !/^\d+$/.test(rawAmount)) {
		return { error: "Nominal transaksi harus lebih dari IDR 0." };
	}

	const numericAmount = Number(rawAmount);
	if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
		return { error: "Nominal transaksi harus lebih dari IDR 0." };
	}

	try {
		const [pocket, category] = await Promise.all([
			db
				.select()
				.from(pockets)
				.where(and(eq(pockets.id, pocketId), eq(pockets.userId, session.id)))
				.get(),
			db
				.select()
				.from(categories)
				.where(eq(categories.id, categoryId))
				.get(),
		]);

		if (!pocket) {
			return { error: "Pocket tidak ditemukan atau tidak valid." };
		}

		if (!category) {
			return { error: "Kategori transaksi tidak ditemukan." };
		}

		const currentBalance = Number(pocket.balance || 0);

		if (category.type === "expense" && numericAmount > currentBalance) {
			return { error: "Saldo pocket tidak mencukupi" };
		}

		const newBalance =
			category.type === "income"
				? currentBalance + numericAmount
				: currentBalance - numericAmount;

		const transactionDate = getJakartaDateString();

		await db.batch([
			db.insert(transactions).values({
				userId: session.id,
				pocketId: pocket.id,
				relatedPocketId: null,
				categoryId: category.id,
				amount: String(numericAmount),
				transactionDate,
				note,
			}),
			db
				.update(pockets)
				.set({ balance: String(newBalance) })
				.where(and(eq(pockets.id, pocket.id), eq(pockets.userId, session.id))),
		]);
	} catch (err) {
		console.error("Create transaction error:", err);
		return {
			error: "Terjadi kesalahan saat menyimpan transaksi. Coba lagi nanti.",
		};
	}

	revalidatePath("/home");
	revalidatePath("/transactions");
	revalidatePath("/transactions/transfer");
	redirect("/home");
}

export async function createTransferAction(
	_prevState: TransactionActionState | null,
	formData: FormData,
): Promise<TransactionActionState> {
	const session = await requireSession();

	const sourcePocketId = formData.get("pocketId")?.toString().trim() ?? "";
	const destinationPocketId =
		formData.get("relatedPocketId")?.toString().trim() ?? "";
	const note = formData.get("note")?.toString().trim() ?? "";
	const rawAmount = formData.get("amount")?.toString().trim() ?? "";

	if (!sourcePocketId) {
		return { error: "Silakan pilih pocket sumber terlebih dahulu." };
	}

	if (!destinationPocketId) {
		return { error: "Silakan pilih pocket tujuan terlebih dahulu." };
	}

	if (sourcePocketId === destinationPocketId) {
		return { error: "Pocket sumber dan pocket tujuan tidak boleh sama." };
	}

	if (!note) {
		return { error: "Silakan isi catatan transfer." };
	}

	if (!rawAmount || !/^\d+$/.test(rawAmount)) {
		return { error: "Nominal transfer harus lebih dari IDR 0." };
	}

	const numericAmount = Number(rawAmount);
	if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
		return { error: "Nominal transfer harus lebih dari IDR 0." };
	}

	try {
		const [sourcePocket, destinationPocket, transferCategory] =
			await Promise.all([
				db
					.select()
					.from(pockets)
					.where(
						and(eq(pockets.id, sourcePocketId), eq(pockets.userId, session.id)),
					)
					.get(),
				db
					.select()
					.from(pockets)
					.where(
						and(
							eq(pockets.id, destinationPocketId),
							eq(pockets.userId, session.id),
						),
					)
					.get(),
				db
					.select()
					.from(categories)
					.where(
						and(
							eq(categories.name, "transfer"),
							eq(categories.type, "expense"),
						),
					)
					.get(),
			]);

		if (!sourcePocket || !destinationPocket) {
			return { error: "Pocket sumber atau tujuan tidak valid." };
		}

		if (!transferCategory) {
			return { error: "Kategori transfer tidak ditemukan." };
		}

		const currentSourceBalance = Number(sourcePocket.balance || 0);

		if (numericAmount > currentSourceBalance) {
			return { error: "Saldo pocket tidak mencukupi" };
		}

		const currentDestinationBalance = Number(destinationPocket.balance || 0);
		const newSourceBalance = currentSourceBalance - numericAmount;
		const newDestinationBalance = currentDestinationBalance + numericAmount;
		const transactionDate = getJakartaDateString();

		// Karena kategori "transfer" bertipe "expense", pocketId menyimpan pocket pengirim (-amount)
		// dan relatedPocketId menyimpan pocket penerima (+amount).
		await db.batch([
			db.insert(transactions).values({
				userId: session.id,
				pocketId: sourcePocket.id,
				relatedPocketId: destinationPocket.id,
				categoryId: transferCategory.id,
				amount: String(numericAmount),
				transactionDate,
				note,
			}),
			db
				.update(pockets)
				.set({ balance: String(newSourceBalance) })
				.where(
					and(eq(pockets.id, sourcePocket.id), eq(pockets.userId, session.id)),
				),
			db
				.update(pockets)
				.set({ balance: String(newDestinationBalance) })
				.where(
					and(
						eq(pockets.id, destinationPocket.id),
						eq(pockets.userId, session.id),
					),
				),
		]);
	} catch (err) {
		console.error("Create pocket transfer error:", err);
		return {
			error: "Terjadi kesalahan saat memproses transfer. Coba lagi nanti.",
		};
	}

	revalidatePath("/home");
	revalidatePath("/transactions");
	revalidatePath("/transactions/transfer");
	redirect("/home");
}
