import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      _id?: string;
      imageUrl?: string;
      provider?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    _id?: string;
    imageUrl?: string;
    provider?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    _id?: string;
    imageUrl?: string;
    provider?: string;
    role?: string;
  }
}
