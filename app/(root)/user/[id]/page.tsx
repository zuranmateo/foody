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
  //console.log(session)

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

  const profileImage = user?.image || user?.imageUrl || "/defaultProfileImg.png";

  return (
    <main className="main">
      <div className="flex items-start justify-between gap-6 rounded-2xl border p-6">
        <div className="flex items-center gap-4">
          <Image
            src={profileImage}
            alt="Profile image"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <h1>{[user?.name, user?.surname].filter(Boolean).join(" ") || user?.name || "User"}</h1>
            <p>{user?.email}</p>
            {user?.phone ? <p>{user?.phone}</p> : null}
            {user?.address ? <p>{user?.address}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <Link href={`/user/${id}/edit`} className="rounded-xl border px-4 py-2">
              Edit profile
            </Link>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="rounded-xl border px-4 py-2">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mt-8">
        <h2>Your orders</h2>

        {orders?.length ? (
          <div className="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <p className="mt-4">You do not have any orders yet.</p>
        )}
      </section>
    </main>
  );
}
