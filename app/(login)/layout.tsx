import { auth } from "@/auth";
import Navbar from "@/components/navbar";
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
        <Navbar />
        {children}
    </>
  );
}
