import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const vercelUrl = process.env.VERCEL_URL;

if (!process.env.NEXTAUTH_URL && vercelUrl) {
  process.env.NEXTAUTH_URL = `https://${vercelUrl}`;
}

export const authSecret = process.env.NEXTAUTH_SECRET || "ticktock-demo-secret";
export const authPages = {
  signIn: "/login",
  error: "/login",
} as const;

const MOCK_USERS = [
  { id: "1", name: "John Doe", email: "john@example.com", password: "password123" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", password: "password123" },
];

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = MOCK_USERS.find(
          (candidate) =>
            candidate.email === credentials.email &&
            candidate.password === credentials.password
        );

        if (!user) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: authPages,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: authSecret,
};