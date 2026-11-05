import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("stack_session");
  const { pathname } = request.nextUrl;

  if (pathname === "/" && sessionCookie?.value) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (pathname.startsWith("/home") && !sessionCookie?.value) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*"],
};

