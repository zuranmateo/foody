import { default as NextAuth } from 'next-auth';
import GitHubProvider from "next-auth/providers/github"
import { client } from "./sanity/lib/client";
import { USER_BY_EMAIL_QUERY, USER_BY_GITHUB_ID_QUERY, USER_BY_ID_QUERY } from "./sanity/lib/query";
import { writeClient } from "./sanity/lib/write-client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

function getGitHubProfileId(profile: { id?: string | number | null } | null | undefined) {
  if (profile?.id === undefined || profile.id === null) {
    return null;
  }

  return String(profile.id);
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const email = String(credentials.email);
  const password = String(credentials.password);

  const user = await client.fetch(
  USER_BY_EMAIL_QUERY, { email });

  if (!user) return null;
  if (!user.password) return null;
  //console.log(user);
  //console.log(user.image,)

  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) return null;

  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: null,
    image: user.image,
    imageUrl: user.imageUrl,
    role: user.role,
  };
}

    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })],
  callbacks: {
    async signIn({ user, profile, account }) {
      if(account?.provider == "github"){
        const githubProfileId = getGitHubProfileId(profile);

        if (!githubProfileId) {
          return false;
        }

        const existingUser = await client.fetch(USER_BY_GITHUB_ID_QUERY, { 
          id: githubProfileId,
       });
      if(!existingUser){
        await writeClient.create({
          _type: 'users',
          id: githubProfileId,
          name: user?.name,
          email: user?.email,
          imageUrl: user?.image,
        })
      }
      }
      return true;
    },

    async jwt({token, account, profile, user}){
      if(account && profile){
        const githubProfileId = getGitHubProfileId(profile);

        if (!githubProfileId) {
          return token;
        }

        const user = await client.fetch(USER_BY_GITHUB_ID_QUERY, {
          id: githubProfileId,
        });

        token.provider = "github";
        token.id = user?.id;
        token._id = user?._id
        token.imageUrl = user?.imageUrl;
        token.role = user?.role;
      }
      else if(user){
        token.provider = "credentials";
        token.id = user.id;
        token._id = user._id;
        token.imageUrl = user.imageUrl;
        token.role = user.role;
      }
      else if (token._id && !token.role) {
        const existingUser = await client.fetch(USER_BY_ID_QUERY, {
          id: token._id,
        });

        token.id = existingUser?.id ?? token.id;
        token._id = existingUser?._id ?? token._id;
        token.imageUrl = existingUser?.imageUrl ?? token.imageUrl;
        token.role = existingUser?.role;
      }
      return token;
    },

    async session({ session, token }){
      Object.assign(session.user, {id: token.id, imageUrl: token.imageUrl, _id: token._id, provider: token.provider, role: token.role});
      //console.log(session)
      return session;
    },
  }
})
