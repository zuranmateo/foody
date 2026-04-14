import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UpdateUserProfile } from "@/lib/user-actions";
import { PROFILE_USER_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type EditUserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type UserProfile = {
  _id: string;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  imageUrl?: string;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?._id) {
    redirect("/login");
  }

  if (session.user._id !== id) {
    redirect("/");
  }

  const user = await writeClient.fetch<UserProfile>(PROFILE_USER_QUERY, { id });

  if (!user) {
    redirect("/");
  }

  const profileImage = user.image || user.imageUrl || "/defaultProfileImg.png";

  return (
    <main className="main">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1>Edit profile</h1>
        <Link href={`/user/${id}`} className="rounded-xl border px-4 py-2">
          Back to profile
        </Link>
      </div>

      <div className="rounded-2xl border p-6">
        <div className="mb-6 flex items-center gap-4">
          <Image
            src={profileImage}
            alt="Current profile image"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <h2>{user.name || "User"}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <form action={UpdateUserProfile} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={id} />
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" defaultValue={user.name || ""} required className="rounded-xl border px-3 py-2" />

          <label htmlFor="surname">Surname</label>
          <input id="surname" name="surname" type="text" defaultValue={user.surname || ""} className="rounded-xl border px-3 py-2" />
          {session?.user?.provider == "credentials" ? (
            <>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" defaultValue={user.email || ""} required className="rounded-xl border px-3 py-2" />
            </>
          ):(
            <input type="hidden" name="email" id="email" value={user.email || ""}/>
          )}
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="text" defaultValue={user.phone || ""} className="rounded-xl border px-3 py-2" />

          <label htmlFor="address">Address</label>
          <input id="address" name="address" type="text" defaultValue={user.address || ""} className="rounded-xl border px-3 py-2" />

          {session?.user?.provider == "credentials" ? (
            <>
              <label htmlFor="image">Choose new profile image</label>
              <input id="image" name="image" type="file" accept="image/*" className="rounded-xl border px-3 py-2" />
            </>
          ):(
            ""
          )}

          <button type="submit" className="w-fit rounded-xl border px-4 py-2">
            Save profile
          </button>
        </form>
      </div>
    </main>
  );
}
