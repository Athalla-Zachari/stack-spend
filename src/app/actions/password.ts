"use server";

import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";
import {
  hashPassword,
  requireSession,
  verifyPassword,
} from "@/lib/auth";
import {
  getIncorrectPasswordError,
  getThrottleStatus,
  recordFailedAttempt,
  validatePasswordChangeInput,
  type AttemptRecord,
  type PasswordField,
} from "@/lib/password";

export type PasswordActionState = {
  error?: string;
  field?: PasswordField;
  success?: boolean;
};

// shortcut: in-memory attempt throttle resets on serverless cold starts; persist in DB/KV if cross-instance rate limiting is needed.
const failedAttemptsByUser = new Map<string, AttemptRecord>();

export async function changePasswordAction(
  _prevState: PasswordActionState | null,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await requireSession();
  const now = Date.now();

  if (getThrottleStatus(failedAttemptsByUser, session.id, now).blocked) {
    return {
      field: "currentPassword",
      error:
        "Too many incorrect password attempts. Wait 5 minutes and try again.",
    };
  }

  const rawCurrent = formData.get("currentPassword");
  const rawNew = formData.get("newPassword");
  const rawConfirm = formData.get("confirmPassword");

  const currentPassword = typeof rawCurrent === "string" ? rawCurrent : "";
  const newPassword = typeof rawNew === "string" ? rawNew : "";
  const confirmPassword = typeof rawConfirm === "string" ? rawConfirm : "";

  const validated = validatePasswordChangeInput(
    currentPassword,
    newPassword,
    confirmPassword,
  );
  if (!validated.ok) {
    return { field: validated.field, error: validated.error };
  }

  try {
    const user = await db
      .select({
        id: profiles.id,
        passwordHash: profiles.passwordHash,
      })
      .from(profiles)
      .where(eq(profiles.id, session.id))
      .get();

    if (!user) {
      return { error: "Account not found. Please sign in again." };
    }

    const isCurrentValid = await verifyPassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      const attempts = recordFailedAttempt(
        failedAttemptsByUser,
        session.id,
        now,
      );
      return {
        field: "currentPassword",
        error: getIncorrectPasswordError(attempts),
      };
    }

    const isSameAsStored = await verifyPassword(newPassword, user.passwordHash);
    if (isSameAsStored) {
      return {
        field: "newPassword",
        error: "New password must be different from your current password.",
      };
    }

    const nextHash = await hashPassword(newPassword);

    await db
      .update(profiles)
      .set({ passwordHash: nextHash })
      .where(eq(profiles.id, session.id));

    failedAttemptsByUser.delete(session.id);
    return { success: true };
  } catch (err) {
    console.error("Change password error:", err);
    return { error: "Could not update password. Please try again." };
  }
}
