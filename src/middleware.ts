import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("stack_session");
  const { pathname } = request.nextUrl;

  // isLoggedIn dan mengakses root "/", redirect to /dashboard
  if (pathname === "/" && sessionCookie?.value) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // isLoggedIn = false dan mengakses /dashboard, redirect to "/"
  if (pathname.startsWith("/dashboard") && !sessionCookie?.value) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};

