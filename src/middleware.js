import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session");

  const ua = req.headers.get("user-agent") || "";
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);

  // ===============================
  // ROOT ROUTE (ENTRY POINT)
  // ===============================
  if (pathname === "/") {
    const url = req.nextUrl.clone();

    if (!session) {
      return NextResponse.next(); // tampilkan login
    }

    url.pathname = isMobile ? "/m" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // ===============================
  // AUTH CHECK
  // ===============================
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ===============================
  // MOBILE GUARD
  // ===============================
  if (isMobile && !pathname.startsWith("/m")) {
    const url = req.nextUrl.clone();
    url.pathname = "/m";
    return NextResponse.redirect(url);
  }

  // ===============================
  // DESKTOP GUARD
  // ===============================
  if (!isMobile && pathname.startsWith("/m")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",                // ⬅️ WAJIB
    "/dashboard/:path*",
    "/app/:path*",
    "/m/:path*",
  ],
};
