import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for api routes
  if (pathname.startsWith("/api")) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(es|en|ca|zh)/:path*",
  ],
};
