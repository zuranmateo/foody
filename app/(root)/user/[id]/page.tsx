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
    <main className="">
      <div className="">
        <div className="">
          <Image
            src={profileImage}
            alt="Profile image"
            width={96}
            height={96}
            className=""
          />
          <div>
            <h1>{[user?.name, user?.surname].filter(Boolean).join(" ") || user?.name || "User"}</h1>
            <p>{user?.email}</p>
            {user?.phone ? <p>{user?.phone}</p> : null}
            {user?.address ? <p>{user?.address}</p> : null}
            {user?.role ? <p>Role: {user?.role}</p> : null}
          </div>
        </div>

        <div className="">
            <Link href={`/user/${id}/edit`} className="">
              Edit profile
            </Link>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="">
        <h2>Your orders</h2>

        {orders?.length ? (
          <div className="">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <p className="">You do not have any orders yet.</p>
        )}
      </section>
    </main>
  );
}
