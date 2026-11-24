"use server";

import { redirect } from "next/navigation";
import { eq, or, sql } from "drizzle-orm";
import { db, profiles } from "@/db";
import { verifyPassword, setSession, clearSession } from "@/lib/auth";

export type AuthState = {
  error?: string;
  warning?: string;
  info?: string;
  success?: boolean;
};

// 1. LOGIN ACTION
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const identifier = formData.get("identifier")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    return { error: "Silakan masukkan username/email dan password." };
  }

  try {
    // Cari user berdasarkan email atau display_name
    const candidates = await db
      .select()
      .from(profiles)
      .where(
        or(
          eq(sql`lower(trim(${profiles.email}))`, identifier.toLowerCase()),
          eq(profiles.displayName, identifier),
        ),
      )
      .all();

    let matchedUser: (typeof candidates)[number] | null = null;
    for (const candidate of candidates) {
      if (await verifyPassword(password, candidate.passwordHash)) {
        matchedUser = candidate;
        break;
      }
    }

    if (!matchedUser) {
      return { error: "Username/email atau password salah." };
    }

    // Set session cookie
    await setSession({
      id: matchedUser.id,
      email: matchedUser.email,
      displayName: matchedUser.displayName,
    });
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Terjadi kesalahan saat login. Coba lagi nanti." };
  }

  // Redirect ke home
  redirect("/home");
}


// 3. LOGOUT ACTION
export async function logoutAction() {
  await clearSession();
  redirect("/");
}

