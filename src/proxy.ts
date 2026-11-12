import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("stack_session");
  const { pathname } = request.nextUrl;

  if (pathname === "/" && sessionCookie?.value) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (
    (pathname.startsWith("/home") ||
      pathname.startsWith("/transactions") ||
      pathname.startsWith("/debts") ||
      pathname.startsWith("/history") ||
      pathname.startsWith("/daily-spending") ||
      pathname.startsWith("/spendings")) &&
    !sessionCookie?.value
  ) {
    return NextResponse.redirect(new URL("/", request.url));
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
  ],
};
