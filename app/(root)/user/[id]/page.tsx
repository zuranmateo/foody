import { auth, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PROFILE_USER_QUERY, USER_ORDERS_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";
import OrderCard from "@/components/cards/OrderCard";

type UserPageProps = {
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
  role?: string;
  image?: string;
  imageUrl?: string;
  _createdAt?: string;
};

type UserOrder = {
  _id: string;
  _createdAt: string;
  totalPrice?: number;
  status?: string;
  items?: Array<{
    quantity?: number;
    dish?: {
      _id: string;
      name?: string;
      slug?: string;
      price?: number;
    };
  }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?._id) {
    redirect("/login");
  }

  if (session.user._id !== id) {
    redirect("/");
  }

  const [user, orders] = await Promise.all([
    writeClient.fetch<UserProfile>(PROFILE_USER_QUERY, { id }),
    writeClient.fetch<UserOrder[]>(USER_ORDERS_QUERY, { id }),
  ]);

  if (!user) {
    redirect("/");
  }

  const profileImage =
    user?.image || user?.imageUrl || "/defaultProfileImg.png";

  return (
    <main className="md:w-225 w-100 my-5 mx-auto shadow-lg p-5">
      <div className="">
        <div className="flex p-2">
          <Image
            src={profileImage}
            alt="Profile image"
            width={96}
            height={96}
            className="w-25 h-25 rounded-full m-3 border-2 border-black object-cover"
          />
          <div>
            <h1 className="m-5 font-bold text-2xl">
              {[user?.name, user?.surname].filter(Boolean).join(" ") ||
                user?.name ||
                "User"}
            </h1>
            <p>{user?.email}</p>
            {user?.phone ? <p>{user?.phone}</p> : null}
            {user?.address ? <p>{user?.address}</p> : null}
          </div>
        </div>

        <div className="flex gap-5 items-center justify-center border font-bold border-black p-3 bg-black text-white uppercase mt-5">
          <Link
            href={`/user/${id}/edit`}
            className="rounded bg-black text-white p-2"
          >
            Edit profile
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="rounded bg-black text-white p-2">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="font-bold text-xl mb-3">Your orders</h2>

        {orders?.length ? (
          <div className="">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <p className="text-center p-5">
            You do not have any orders yet.
          </p>
        )}
      </section>
    </main>
  );
}