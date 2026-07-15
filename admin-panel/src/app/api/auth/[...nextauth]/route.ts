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
        initData: { label: "Init Data", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.initData) {
          const crypto = require("crypto");
          const botToken = process.env.BOT_TOKEN;
          if (!botToken) throw new Error("BOT_TOKEN is not defined");
          
          const urlParams = new URLSearchParams(credentials.initData);
          const hash = urlParams.get("hash");
          urlParams.delete("hash");
          urlParams.sort();
          
          let dataCheckString = "";
          for (const [key, value] of urlParams.entries()) {
            dataCheckString += `${key}=${value}\n`;
          }
          dataCheckString = dataCheckString.slice(0, -1);
          
          const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
          const calculatedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
          
          if (calculatedHash !== hash) {
            throw new Error("Маълумоти Телеграм нодуруст аст (Invalid Hash).");
          }
          
          const tgUser = JSON.parse(urlParams.get("user") || "{}");
          if (!tgUser.id) throw new Error("ID-и Телеграм ёфт нашуд.");
          
          const telegramId = BigInt(tgUser.id);
          const user = await prisma.user.findUnique({ where: { telegramId } });
          
          if (!user) throw new Error("Корбар ёфт нашуд.");
          if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
            throw new Error("Шумо ҳуқуқи ворид шудан надоред.");
          }
          
          return {
            id: user.id.toString(),
            name: user.firstName || "Admin",
            role: user.role,
          };
        }

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
