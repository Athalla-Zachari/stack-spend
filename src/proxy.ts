import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const PROTECTED_PATHS = [
  "/home",
  "/transactions",
  "/debts",
  "/history",
  "/daily-spending",
  "/spendings",
  "/settings",
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Verifies the session cookie before redirecting so stale/expired cookies
 * do not trigger an infinite redirect loop between "/" and protected routes.
 */
export async function proxy(request: NextRequest) {
  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = rawToken ? await verifySessionToken(rawToken) : null;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    const response = NextResponse.next();
    if (rawToken) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  if (isProtectedPath(pathname) && !session) {
    const response = NextResponse.redirect(new URL("/", request.url));
    if (rawToken) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/transactions/:path*",
    "/debts/:path*",
    "/history/:path*",
    "/daily-spending/:path*",
    "/spendings/:path*",
    "/settings/:path*",
  ],
};
