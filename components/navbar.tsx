import Link from "next/link"
import Image from "next/image"
import { auth, signOut } from "@/auth"
import KartNumber from "./ui/KartNumber";
import { SanityLive } from '@/sanity/lib/live';

export default async function Navbar() {

  const session = await auth();

  return (
      <nav className="flex items-center justify-between w-full">
 
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
                  <span className="">Menu</span>
                </Link>

                <Link href="/">
                  <span className="">Home</span>
                </Link>

                {session.user.role === "admin" ? (
                  <Link href="/control">
                    <span className="">
                      Admin
                    </span>
                  </Link>
                ) : null}

                <Link href="/cart">
                  <KartNumber/>
                </Link>

                <Link href={`/user/${session?.user._id}`} className="">
                  <span>
                    {session?.user?.name}
                  </span>
                  <Image src={`${session?.user?.image || session?.user?.imageUrl || "/defaultProfileImg.png"}`}  alt="profile picture" height={50} width={50} className="rounded-full border-3 mx-2 lg:mx-3 lg:h-9 lg:w-9 h-7 w-7 object-cover" />
                </Link>
            </>
          ):(
            <button className="mx-5 gap-5">
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
