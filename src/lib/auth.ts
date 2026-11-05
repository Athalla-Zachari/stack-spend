import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "stack_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "stack-spend-super-secret-key-98234712";

// Password Hashing & Verification
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Tamper-Proof Session Signing via Web Crypto API (Built-in)
async function getSigningKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const enc = new TextEncoder();
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      ...user,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  );
  const data = `${header}.${payload}`;
  const key = await getSigningKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(data)
  );
  const signature = Buffer.from(signatureBuffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;

    const key = await getSigningKey();
    const enc = new TextEncoder();

    let base64Sig = signature.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) {
      base64Sig += "=";
    }
    const sigBytes = Buffer.from(base64Sig, "base64");

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(data)
    );
    if (!isValid) return null;

    const parsed = JSON.parse(base64UrlDecode(payload));
    if (Date.now() > parsed.exp) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      displayName: parsed.displayName,
    };
  } catch {
    return null;
  }
}

// Cookie Management
export async function setSession(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

