// ในไฟล์ middleware.ts
import {
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  authRouter,
  publicRoutes,
} from "@/route";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Paths ที่อนุญาตให้เข้าถึงได้โดยไม่ต้องล็อกอิน
  const publicApiRoutes = [
    "/api/tables",
    "/api/menu",
    "/api/orders",
    "/api/draft-cart", // ✅ ให้ guest ใช้ได้
  ];
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    publicApiRoutes.some((path) => nextUrl.pathname.startsWith(path));
  const isAuthRoute = authRouter.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)", "/", "/api|trpc(.*)"],
};
