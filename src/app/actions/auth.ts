"use server";

import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { db, profiles, pockets } from "@/db";
import { hashPassword, verifyPassword, setSession, clearSession } from "@/lib/auth";

export type AuthState = {
  error?: string;
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

  // Redirect ke dashboard
  redirect("/dashboard");
}

// 2. REGISTER ACTION (Opsional jika ingin daftar akun baru langsung dari UI)
export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const displayName = formData.get("displayName")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!displayName || !email || !password) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Password minimal harus 6 karakter." };
  }

  let newUserId: string;

  try {
    // Cek apakah email sudah terdaftar
    const existing = await db
      .select()
      .from(profiles)
      .where(or(eq(profiles.email, email), eq(profiles.displayName, displayName)))
      .get();

    if (existing) {
      return { error: "Nama atau Email sudah digunakan." };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(profiles)
      .values({
        displayName,
        email,
        passwordHash,
      })
      .returning();

    newUserId = newUser.id;

    // Buat dompet utama default (Pocket)
    await db.insert(pockets).values({
      userId: newUserId,
      name: "Cash / Tunai",
      balance: "0.00",
    });

    await setSession({
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
    });
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }

  redirect("/dashboard");
}

// 3. LOGOUT ACTION
export async function logoutAction() {
  await clearSession();
  redirect("/");
}

