import { default as NextAuth } from 'next-auth';
import GitHubProvider from "next-auth/providers/github"
import { client } from "./sanity/lib/client";
import { USER_BY_EMAIL_QUERY, USER_BY_GITHUB_ID_QUERY } from "./sanity/lib/query";
import { writeClient } from "./sanity/lib/write-client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";


let id: number | null;
 
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

  id = user.id;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: null,
    image: user.image,
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
        const existingUser = await client.fetch(USER_BY_GITHUB_ID_QUERY, { 
          id: profile?.id,
       });
      if(!existingUser){
        await writeClient.create({
          _type: 'users',
          id: profile?.id,
          name: user?.name,
          email: user?.email,
          imageUrl: user?.image,
        })
      }
      }
      return true;
    },

    async jwt({token, account, profile}){
      if(account && profile){
        const user = await client.fetch(USER_BY_GITHUB_ID_QUERY, {
          id: profile?.id,
        });

        token.provider = "github";
        token.id = user?.id;
        token._id = user?._id
        token.imageUrl = user?.imageUrl;
      }
      else if(id){
        const user = await client.fetch(USER_BY_GITHUB_ID_QUERY, {
          id: id,
        });
        token.provider = "credentials";
        token.id = user?.id;
        token._id = user?._id
        //console.log(user?._id);
      }
      return token;
    },

    async session({ session, token }){
      Object.assign(session.user, {id: token.id, imageUrl: token.imageUrl, _id: token._id, provider: token.provider});
      //console.log(session)
      return session;
    },
  }
})
