import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Telegram ID & Password",
      credentials: {
        telegramId: { label: "Telegram ID", type: "text", placeholder: "123456789" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.telegramId || !credentials?.password) {
          throw new Error("Лутфан Telegram ID ва паролро ворид кунед.");
        }

        let telegramId;
        try {
          telegramId = BigInt(credentials.telegramId);
        } catch {
          throw new Error("Telegram ID нодуруст аст.");
        }

        const user = await prisma.user.findUnique({
          where: { telegramId },
        });

        if (!user) {
          throw new Error("Корбар бо ин Telegram ID ёфт нашуд.");
        }

        if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
          throw new Error("Шумо ҳуқуқи ворид шудан ба админ-панелро надоред.");
        }

        if (!user.password) {
          throw new Error("Барои ин корбар парол муқаррар нашудааст.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Парол нодуруст аст.");
        }

        return {
          id: user.id.toString(),
          name: user.firstName || "Admin",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
