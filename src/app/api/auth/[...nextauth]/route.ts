import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { createClient } from "@supabase/supabase-js"

// Supabase client for checking profile
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all Google sign-ins
      // We'll check profile completion in redirect callback
      return true
    },

    async redirect({ url, baseUrl }) {
      // After sign-in, check if profile exists and is complete
      // This runs after successful authentication
      
      // If redirecting to a callback URL, use it
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Default: redirect to profile page
      // The profile page will check if complete and redirect if needed
      return `${baseUrl}/profile`
    },

    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      return token
    },

    async session({ session, token }) {
      // Add user id to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      return session
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
