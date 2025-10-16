// src/types/next-auth.d.ts

import { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Tell TypeScript that we are modifying the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    // This is the property we are adding to the JWT
    id: string;
    role?: "admin" | "user";
  }
}

// Tell TypeScript that we are modifying the Session type
declare module "next-auth" {
  /**
   * The shape of the user object in the session.
   * We keep the default properties and add our own.
   */
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role?: "admin" | "user";
    } & DefaultSession["user"]; 
  }

  /**
   * The shape of the user object returned by the authorize callback.
   * We add our custom id property.
   */
  interface User {
    id: string;
    role?: "admin" | "user";
  }
}