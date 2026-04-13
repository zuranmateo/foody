import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth();
    {session ? redirect("/") : ""}
  return (
    <>
        {children}
    </>
  );
}
