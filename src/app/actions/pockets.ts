"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db, pockets } from "@/db";
import { ensurePocketArchiveColumn } from "@/db/queries";
import { requireSession } from "@/lib/auth";
import {
  hasDuplicateActivePocketName,
  validatePocketName,
} from "@/lib/pockets";

export type PocketActionState = {
  error?: string;
  success?: boolean;
  pocketName?: string;
  disabledPocketName?: string;
};

const POCKET_REVALIDATE_PATHS = [
  "/settings/pockets",
  "/home",
  "/history",
  "/transactions",
  "/transactions/transfer",
  "/debts",
] as const;

function revalidatePocketPaths() {
  for (const path of POCKET_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function createPocketAction(
  _prevState: PocketActionState | null,
  formData: FormData,
): Promise<PocketActionState> {
  const session = await requireSession();
  const rawName = formData.get("name")?.toString() ?? "";

  const validated = validatePocketName(rawName);
  if (!validated.ok) {
    return { error: validated.error };
  }

  try {
    await ensurePocketArchiveColumn();

    const activePockets = await db
      .select({ name: pockets.name })
      .from(pockets)
      .where(and(eq(pockets.userId, session.id), isNull(pockets.archivedAt)));

    if (
      hasDuplicateActivePocketName(
        activePockets.map((p) => p.name),
        validated.name,
      )
    ) {
      return { error: "A pocket with that name already exists." };
    }

    await db.insert(pockets).values({
      userId: session.id,
      name: validated.name,
      balance: "0.00",
      archivedAt: null,
    });
  } catch (err) {
    console.error("Create pocket error:", err);
    return { error: "Could not add pocket. Please try again." };
  }

  revalidatePocketPaths();
  return { success: true, pocketName: validated.name };
}

export async function disablePocketAction(
  _prevState: PocketActionState | null,
  formData: FormData,
): Promise<PocketActionState> {
  const session = await requireSession();
  const pocketId = formData.get("pocketId")?.toString().trim() ?? "";

  if (!pocketId) {
    return { error: "Invalid pocket selected." };
  }

  let disabledName = "";

  try {
    await ensurePocketArchiveColumn();

    const existing = await db
      .select({ id: pockets.id, name: pockets.name })
      .from(pockets)
      .where(
        and(
          eq(pockets.id, pocketId),
          eq(pockets.userId, session.id),
          isNull(pockets.archivedAt),
        ),
      )
      .get();

    if (!existing) {
      return { error: "Pocket not found or already disabled." };
    }

    disabledName = existing.name;

    await db
      .update(pockets)
      .set({ archivedAt: new Date().toISOString() })
      .where(
        and(
          eq(pockets.id, pocketId),
          eq(pockets.userId, session.id),
          isNull(pockets.archivedAt),
        ),
      );
  } catch (err) {
    console.error("Disable pocket error:", err);
    return { error: "Could not disable pocket. Please try again." };
  }

  revalidatePocketPaths();
  return { success: true, disabledPocketName: disabledName };
}
