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
    <main className="p-5 my-5 shadow-lg w-150 mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-2">Edit profile</h1>
        <Link
          href={`/user/${id}`}
          className="block w-full border bg-black text-white text-center cursor-pointer p-2 rounded"
        >
          Back to profile
        </Link>
      </div>

      <div className="">
        <div className="flex p-2 items-center gap-3">
          <Image
            src={profileImage}
            alt="Current profile image"
            width={96}
            height={96}
            className="w-25 h-25 rounded-full m-3 border-2 border-black object-cover"
          />
          <div>
            <h2 className="font-bold text-xl">{user.name || "User"}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <form action={UpdateUserProfile} className="flex flex-col gap-3 mt-5">
          <input type="hidden" name="userId" value={id} />

          <label htmlFor="name" className="font-bold">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name || ""}
            required
            className="rounded border px-3 py-2"
          />

          <label htmlFor="surname" className="font-bold">
            Surname
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            defaultValue={user.surname || ""}
            className="rounded border px-3 py-2"
          />

          {session?.user?.provider == "credentials" ? (
            <>
              <label htmlFor="email" className="font-bold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ""}
                required
                className="rounded border px-3 py-2"
              />
            </>
          ) : (
            <input
              type="hidden"
              name="email"
              id="email"
              value={user.email || ""}
            />
          )}

          <label htmlFor="phone" className="font-bold">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={user.phone || ""}
            className="rounded border px-3 py-2"
          />

          <label htmlFor="address" className="font-bold">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={user.address || ""}
            className="rounded border px-3 py-2"
          />

          {session?.user?.provider == "credentials" ? (
            <>
              <label htmlFor="image" className="font-bold">
                Choose new profile image
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="rounded border px-3 py-2"
              />
            </>
          ) : (
            ""
          )}

          <button
            type="submit"
            className="w-full border bg-black text-white text-center cursor-pointer p-2 rounded"
          >
            Save profile
          </button>
        </form>
      </div>
    </main>
  );
}