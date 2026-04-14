import { auth } from "@/auth";
import PaypalCheckout from "@/components/checkout/PaypalCheckout";
import { redirect } from "next/navigation";

export default async function OrderPage() {
  const session = await auth();

  if (!session?.user?._id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <PaypalCheckout />
    </main>
  );
}
