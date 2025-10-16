// middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // This callback is used to decide if the user is authorized.
    authorized({ token }) {
      // The token exists if the user is logged in.
      // We return !!token which is a concise way to convert the token to a boolean.
      return !!token;
    },
  },
  pages: {
    // If the user is not authorized, they are redirected to this page.
    signIn: "/admin/login",
  },
});

// This config specifies which routes the middleware should run on.
export const config = {
  matcher: [
    // Protect all routes under /admin, except for the login page itself.
    "/admin/:path*",
    "/admin",
  ],
};