import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials~",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Akun tidak ditemukan");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour = 3600 seconds (change to 30 * 60 for 30 minutes)
  },
  jwt: {
    maxAge: 60 * 60, // Match session maxAge
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      // Check for session expiry on each request
      const now = Math.floor(Date.now() / 1000);
      if (typeof token.exp === 'number' && token.exp < now) {
        // Session expired, return null to force logout
        return null as unknown as typeof token;
      }

      return token;
    },
    async session({ session, token }) {
      // Add token id to session user
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Default daily nutrition goals
export const DEFAULT_DAILY_GOALS = {
  calories: 2000,
  protein: 50,   // grams
  carbs: 250,    // grams
  fat: 65,       // grams
  fiber: 25,     // grams
};