"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, profiles } from "@/db";
import { ensureAvatarColumn } from "@/db/queries";
import { requireSession, setSession } from "@/lib/auth";
import { validateProfileInput } from "@/lib/profile";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  displayName?: string;
  avatarUrl?: string | null;
};

export async function updateProfileAction(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();

  const rawDisplayName = formData.get("displayName")?.toString() ?? "";
  const rawAvatarUrl = formData.get("avatarUrl")?.toString() ?? "";

  const validated = validateProfileInput(rawDisplayName, rawAvatarUrl);
  if (!validated.ok) {
    return { error: validated.error };
  }

  try {
    await ensureAvatarColumn();

    const conflictingUser = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.displayName, validated.displayName),
          ne(profiles.id, session.id),
        ),
      )
      .get();

    if (conflictingUser) {
      return { error: "That username is already taken." };
    }

    await db
      .update(profiles)
      .set({
        displayName: validated.displayName,
        avatarUrl: validated.avatarUrl,
      })
      .where(eq(profiles.id, session.id));

    await setSession({
      id: session.id,
      email: session.email,
      displayName: validated.displayName,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return { error: "Could not save profile changes. Please try again." };
  }

  revalidatePath("/home");
  revalidatePath("/history");
  revalidatePath("/settings");
  revalidatePath("/settings/profile");

  return {
    success: true,
    displayName: validated.displayName,
    avatarUrl: validated.avatarUrl,
  };
}
