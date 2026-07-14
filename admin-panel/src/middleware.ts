import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Only allow ADMIN or SUPERADMIN roles
      return token?.role === "ADMIN" || token?.role === "SUPERADMIN";
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Match all paths except API routes, static files, shop, and login
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|shop).*)",
  ],
};
