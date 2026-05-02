import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { User } from "next-auth"
import type { User as DBUser } from "@/Utils/VAE.type"
export const { handlers, auth, signIn, signOut } = NextAuth({

  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 2 * 60 * 60,    // expire après 2h
    updateAge: 30 * 60,      // renouvelle si actif toutes les 30min
   },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as User).role
        token.name = `${(user as DBUser).prenom} ${(user as DBUser).nom}`
      }
      return token
    },
   async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        // Recharge le nom depuis la BDD
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) return null
        return user
      },
    }),
  ],
})