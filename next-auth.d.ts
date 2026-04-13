// next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      _id?: string;
      imageUrl?: string;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    _id?: string;
    imageUrl?: string;
    provider?: string;
  }
}