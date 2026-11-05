"use server";

import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
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
    const user = await db
      .select()
      .from(profiles)
      .where(or(eq(profiles.email, identifier), eq(profiles.displayName, identifier)))
      .get();

    if (!user) {
      return { error: "Username/email atau password salah." };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Username/email atau password salah." };
    }

    // Set session cookie
    await setSession({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
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

