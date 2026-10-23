import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-cookie";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/join"]);

function hasAdminSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes(AUTH_SESSION_COOKIE) && cookie.value);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!hasAdminSessionCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
