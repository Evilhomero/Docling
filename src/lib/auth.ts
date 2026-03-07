import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Simple single-user credentials for personal use
        if (
          email === process.env.AUTH_CREDENTIALS_EMAIL &&
          password === process.env.AUTH_CREDENTIALS_PASSWORD
        ) {
          return {
            id: '1',
            email,
            name: 'Diego Ortiz',
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/pipeline') ||
        nextUrl.pathname.startsWith('/notes') ||
        nextUrl.pathname.startsWith('/calendar') ||
        nextUrl.pathname.startsWith('/graph') ||
        nextUrl.pathname.startsWith('/settings');

      if (isOnApp) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
  },
});
