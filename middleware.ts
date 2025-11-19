// middleware.ts

import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // Apply i18n middleware first
  return intlMiddleware(req);
}

// This config specifies which routes the middleware should run on.
export const config = {
  matcher: [
    // Skip all internal Next.js paths and api routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};