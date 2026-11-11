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
