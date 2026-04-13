import Link from "next/link"
import Image from "next/image"
import { auth, signOut } from "@/auth"

export default async function Navbar() {

  const session = await auth();

  return (
      <nav className="navbar">
            <Link href="/" className="flex justify-between">
                <Image
                  src="/logoName.png"
                  alt="logo"
                  width={150}
                  height={75}
                />
            </Link>

            <div className="flex flex-row items-center gap-3 lg:gap-5">
              
            {/* Če je uporabnik prijavljen */}
            {session && session?.user ?
            (
              <>
                <Link href="/order">
                  <span className="block bg-primary text-white py-2 px-4 lg:text-xl md:text-sm text-sm rounded-xl">NAROČI ANALIZO</span>
                </Link>

                <form action={async() => {
                  "use server"
                  await signOut({ redirectTo: "/" });
                }}>
                  <button type="submit" name="logout" className="cursor-pointer text-base lg:text-xl">
                    Logout
                  </button>
                </form>
                <Link href={`/profile/${session?.user?._id}`} className="flex justify-between items-center mr-5">
                  <span className="text-base md:text-base lg:text-xl">
                    {session?.user?.name}
                  </span>
                  <Image src={`${session?.user?.image || session?.user?.imageUrl || "/defaultProfileImg.png"}`}  alt="profile picture" height={50} width={50} className="rounded-full border-3 mx-2 lg:mx-3 lg:h-9 lg:w-9 h-7 w-7 object-cover" />
                </Link>
            </>
          ):(
            <button className="block py-2 px-5 mr-5 text-center bg-primary rounded-2xl text-white">
                <Link href="/login">
                    Login
                </Link>
            </button>
          )}
        </div>
      </nav>
  );
}