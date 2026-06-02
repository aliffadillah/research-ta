import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ token }) {
      // If token exists, session is valid
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};