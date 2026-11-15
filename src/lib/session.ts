export const SESSION_COOKIE_NAME = "stack_session";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "stack-spend-super-secret-key-98234712";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

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

/**
 * Creates a signed HS256 session token valid for 7 days.
 */
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

/**
 * Verifies the HMAC signature and expiration timestamp of a session token.
 */
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
