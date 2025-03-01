import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google"

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID,
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || clientId.length === 0)
        throw new Error("Missing GOOGLE_CLIENT_ID");
    if (!clientSecret || clientSecret.length === 0)
        throw new Error("Missing GOOGLE_CLIENT_SECRET");
}

export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials.clientSecret,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            const dbUser = (await db.get(`user:${token.id}`)) as User | null

            if (!dbUser) {
                token.id = user!.id
                return token
            }
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id,
                    session.user.name = token.name,
                    session.use
            }
        }
    }
}