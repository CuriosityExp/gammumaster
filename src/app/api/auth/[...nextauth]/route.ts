// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "QR Code",
      credentials: {
        qrCodeIdentifier: { label: "QR Identifier", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.qrCodeIdentifier) {
          return null;
        }

        console.log(credentials, "CRED");

        const admin = await prisma.admin.findUnique({
          where: { qrCodeIdentifier: credentials.qrCodeIdentifier },
        });

        if (admin) {
          return {
            id: admin.adminId, 
            email: admin.email,
            role: 'admin'
          };
        } else {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "user-credentials", 
      name: "User QR Code",
      credentials: {
        qrCodeIdentifier: { label: "QR Identifier", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.qrCodeIdentifier) return null;
        const user = await prisma.user.findUnique({
          where: { qrCodeIdentifier: credentials.qrCodeIdentifier },
        });
        if (user) {
          // Add a role to distinguish users
          return { id: user.userId, name: user.name, email: user.email, role: 'user' };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // The 'user' object here is what we returned from authorize
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Use user.id, which we mapped from adminId
        token.email = user.email;
        token.role = user.role as "admin" | "user";
      }
      return token;
    },
    // The 'token' object here is what we returned from the jwt callback
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.role = token.role as "admin" | "user";
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };