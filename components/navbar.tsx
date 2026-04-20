import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import KartNumber from "./ui/KartNumber";
import { SanityLive } from '@/sanity/lib/live';

export default async function Navbar() {

  const session = await auth();

  return (
      <nav className="shadow-2xl flex items-center justify-between w-full">
      <style>{`
          body {
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          }
    `}</style>  
            <Link href="/">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={100}
                  height={100}
                />
            </Link>
  
            <div className="flex gap-5 mx-5 items-center ">
              
            {/* Če je uporabnik prijavljen */}
            {session && session?.user ?
            (
              <>
                <Link href="/menu">
                  <span className="navbar">Menu</span>
                </Link>

                <Link href="/">
                  <span className="navbar">Home</span>
                </Link>

                {session.user.role === "admin" ? (
                  <Link href="/control">
                    <span className="navbar">
                      Admin
                    </span>
                  </Link>
                ) : null}

                <Link href="/cart">
                  <KartNumber/>
                </Link>
                <Link href={`/user/${session?.user._id}`} className="flex justify-between items-center mr-5">
                  <Image src={`${session?.user?.image || session?.user?.imageUrl || "/defaultProfileImg.png"}`}  alt="profile picture" height={50} width={50} className="rounded-full border-3 mx-2 lg:mx-3 lg:h-9 lg:w-9 h-7 w-7 object-cover" />
                </Link>
            </>
          ):(
            <button className="navbar mx-5 gap-5">
                <Link href="/login">
                    Login
                </Link>
            </button>
          )}
        </div>
        <SanityLive />
      </nav>
  );
}

/**signout koda
 * <form action={async() => {
                  "use server"
                  await signOut({ redirectTo: "/" });
                }}>
                  <button type="submit" name="logout" className="cursor-pointer text-base lg:text-xl">
                    Logout
                  </button>
                </form>
 */
