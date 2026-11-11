"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, debts } from "@/db";
import { requireSession } from "@/lib/auth";

export type DebtActionState = {
	error?: string;
	success?: boolean;
};

export async function createDebtAction(
	_prevState: DebtActionState | null,
	formData: FormData,
): Promise<DebtActionState> {
	const session = await requireSession();

	const creditorName = formData.get("creditorName")?.toString().trim() ?? "";
	const rawTotalAmount = formData.get("totalAmount")?.toString().trim() ?? "";
	const rawPaidAmount = formData.get("paidAmount")?.toString().trim() ?? "0";
	const dueDate = formData.get("dueDate")?.toString().trim() || null;

	if (!creditorName) {
		return { error: "Nama kreditur / instansi tidak boleh kosong." };
	}

	if (!rawTotalAmount || !/^\d+$/.test(rawTotalAmount)) {
		return { error: "Total hutang harus lebih dari IDR 0." };
	}

	const numericTotal = Number(rawTotalAmount);
	if (!Number.isSafeInteger(numericTotal) || numericTotal <= 0) {
		return { error: "Total hutang harus lebih dari IDR 0." };
	}

	const numericPaid = rawPaidAmount && /^\d+$/.test(rawPaidAmount) ? Number(rawPaidAmount) : 0;
	if (numericPaid < 0 || numericPaid > numericTotal) {
		return { error: "Nominal yang sudah dibayar tidak valid." };
	}

	let status: "unpaid" | "partial" | "paid" = "unpaid";
	if (numericPaid >= numericTotal) {
		status = "paid";
	} else if (numericPaid > 0) {
		status = "partial";
	}

	try {
		await db.insert(debts).values({
			userId: session.id,
			creditorName,
			totalAmount: String(numericTotal),
			paidAmount: String(numericPaid),
			dueDate,
			status,
		});
	} catch (err) {
		console.error("Create debt error:", err);
		return {
			error: "Terjadi kesalahan saat menambahkan hutang. Coba lagi nanti.",
		};
	}

	revalidatePath("/debts");
	return { success: true };
}

export async function repayDebtAction(
	_prevState: DebtActionState | null,
	formData: FormData,
): Promise<DebtActionState> {
	const session = await requireSession();

	const debtId = formData.get("debtId")?.toString().trim() ?? "";
	const rawAmount = formData.get("amount")?.toString().trim() ?? "";

	if (!debtId) {
		return { error: "ID hutang tidak valid." };
	}

	if (!rawAmount || !/^\d+$/.test(rawAmount)) {
		return { error: "Nominal pembayaran harus lebih dari IDR 0." };
	}

	const repayAmount = Number(rawAmount);
	if (!Number.isSafeInteger(repayAmount) || repayAmount <= 0) {
		return { error: "Nominal pembayaran harus lebih dari IDR 0." };
	}

	try {
		const debt = await db
			.select()
			.from(debts)
			.where(and(eq(debts.id, debtId), eq(debts.userId, session.id)))
			.get();

		if (!debt) {
			return { error: "Data hutang tidak ditemukan." };
		}

		const totalAmount = Number(debt.totalAmount);
		const currentPaid = Number(debt.paidAmount || 0);
		const remaining = Math.max(0, totalAmount - currentPaid);

		if (repayAmount > remaining) {
			return {
				error: `Nominal pembayaran melebihi sisa hutang (Maks: IDR ${remaining.toLocaleString("id-ID")}).`,
			};
		}

		const newPaidAmount = currentPaid + repayAmount;
		const newStatus: "unpaid" | "partial" | "paid" =
			newPaidAmount >= totalAmount ? "paid" : "partial";

		await db
			.update(debts)
			.set({
				paidAmount: String(newPaidAmount),
				status: newStatus,
			})
			.where(and(eq(debts.id, debtId), eq(debts.userId, session.id)));
	} catch (err) {
		console.error("Repay debt error:", err);
		return {
			error: "Terjadi kesalahan saat mencatat pembayaran hutang.",
		};
	}

	revalidatePath("/debts");
	return { success: true };
}
