import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_AUTH_REDIRECT,
  privateRoutes,
  authRoutes,
  apiAuthPrefix,
} from "@/routes";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const token =
    cookies.get("authjs.session-token")?.value ||
    cookies.get("__Secure-authjs.session-token")?.value;
  const isLoggedIn = !!token;
  const pathname = nextUrl.pathname;

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.includes(pathname);

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl));
  }

  if (isPrivateRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
