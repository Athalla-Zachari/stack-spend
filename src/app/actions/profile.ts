"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, or, sql } from "drizzle-orm";
import { db, profiles } from "@/db";
import { ensureAvatarColumn } from "@/db/queries";
import { requireSession, setSession } from "@/lib/auth";
import {
  findProfileConflict,
  validateProfileInput,
  type ProfileField,
} from "@/lib/profile";

export type ProfileActionState = {
  error?: string;
  field?: ProfileField;
  success?: boolean;
  displayName?: string;
  email?: string;
  avatarUrl?: string | null;
};

export async function updateProfileAction(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();

  const rawDisplayName = formData.get("displayName");
  const rawEmail = formData.get("email");
  const rawAvatarUrl = formData.get("avatarUrl");

  const displayName = typeof rawDisplayName === "string" ? rawDisplayName : "";
  const email = typeof rawEmail === "string" ? rawEmail : "";
  const avatarUrl = typeof rawAvatarUrl === "string" ? rawAvatarUrl : "";

  const validated = validateProfileInput(displayName, email, avatarUrl);
  if (!validated.ok) {
    return { field: validated.field, error: validated.error };
  }

  try {
    await ensureAvatarColumn();

    const normalizedDisplayName = validated.displayName.toLowerCase();
    const conflictingUsers = await db
      .select({
        displayName: profiles.displayName,
        email: profiles.email,
      })
      .from(profiles)
      .where(
        and(
          ne(profiles.id, session.id),
          or(
            eq(profiles.displayName, validated.displayName),
            eq(sql`lower(trim(${profiles.email}))`, normalizedDisplayName),
            eq(sql`lower(trim(${profiles.email}))`, validated.email),
            eq(sql`lower(trim(${profiles.displayName}))`, validated.email),
          ),
        ),
      );

    const conflict = findProfileConflict(
      conflictingUsers,
      validated.displayName,
      validated.email,
    );
    if (conflict) {
      return conflict;
    }

    await db
      .update(profiles)
      .set({
        displayName: validated.displayName,
        email: validated.email,
        avatarUrl: validated.avatarUrl,
      })
      .where(eq(profiles.id, session.id));

    await setSession({
      id: session.id,
      email: validated.email,
      displayName: validated.displayName,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return { error: "Could not save profile changes. Please try again." };
  }

  revalidatePath("/home");
  revalidatePath("/history");
  revalidatePath("/settings", "layout");
  revalidatePath("/settings");
  revalidatePath("/settings/profile");

  return {
    success: true,
    displayName: validated.displayName,
    email: validated.email,
    avatarUrl: validated.avatarUrl,
  };
}
