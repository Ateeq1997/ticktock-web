import { withAuth } from "next-auth/middleware";
import { authPages, authSecret } from "@/lib/auth";

export default withAuth({
  pages: authPages,
  secret: authSecret,
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
