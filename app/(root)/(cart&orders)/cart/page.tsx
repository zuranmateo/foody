"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { GetCartItemsFromLocalStorage, RemoveCartItemFromLocalStorage } from "@/lib/actions";
import { client } from "@/sanity/lib/client";
import { CART_DISHES_QUERY } from "@/sanity/lib/query";
import { Button } from "@/components/ui/button";

type CartDish = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
};

type CartItem = {
  cartIndex: number;
  dish: CartDish;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadCart = async () => {
      const slugs = GetCartItemsFromLocalStorage();

      if (!slugs.length) {
        if (isActive) {
          setCartItems([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const uniqueSlugs = [...new Set(slugs)];
        const dishes = await client.fetch<CartDish[]>(CART_DISHES_QUERY, { slugs: uniqueSlugs });
        const dishesBySlug = new Map(dishes.map((dish) => [dish.slug, dish]));

        const orderedCartItems = slugs
          .map((slug, cartIndex) => {
            const dish = dishesBySlug.get(slug);

            if (!dish) {
              return null;
            }

            return {
              cartIndex,
              dish,
            };
          })
          .filter((item): item is CartItem => item !== null);

        if (isActive) {
          setCartItems(orderedCartItems);
        }
      } catch {
        if (isActive) {
          setCartItems([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const handleCartUpdate = () => {
      void loadCart();
    };

    void loadCart();
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      isActive = false;
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const handleRemove = (cartIndex: number) => {
    RemoveCartItemFromLocalStorage(cartIndex);
  };

  const totalPrice = cartItems.reduce((total, { dish }) => total + (dish.price ?? 0), 0);
  const availableItems = cartItems.filter(({ dish }) => dish.isAvailable !== false).length;
  const unavailableItems = cartItems.length - availableItems;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(127,29,29,0.12),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(248,250,252,1)_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)]">
          <div className="bg-linear-to-r from-red-950 via-red-900 to-slate-900 px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/70">Your order</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Cart overview</h1>
                <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-base">
                  Review your dishes, remove anything you do not need, and continue when your order looks right.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Items</p>
                  <p className="mt-2 text-3xl font-semibold">{cartItems.length}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Total</p>
                  <p className="mt-2 text-3xl font-semibold">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      {loading ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[1.75rem] border bg-card/70 shadow-sm" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[1.75rem] border bg-card/70 shadow-sm" />
        </section>
      ) : cartItems.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/70 px-6 py-20 text-center shadow-sm">
          <div className="flex h-18 w-18 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="size-8" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is empty</h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Add a few dishes from the menu and they will show up here with your running total.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/menu">Browse the menu</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-4">
            {cartItems.map(({ cartIndex, dish }, index) => (
              <article
                key={`${dish._id}-${cartIndex}`}
                className="group rounded-[1.75rem] border border-border/80 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-red-100 via-red-50 to-slate-100 text-sm font-semibold text-red-950">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">{dish.name}</h2>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {dish.category ?? "Chef special"}
                        </span>
                      </div>
                      {dish.description ? (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {dish.description}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Freshly prepared and ready to be added to your order.
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
                            dish.isAvailable === false
                              ? "border border-amber-200 bg-amber-50 text-amber-700"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {dish.isAvailable === false ? "Unavailable" : "Available now"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Added item #{cartIndex + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                      {formatPrice(dish.price ?? 0)}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemove(cartIndex)}
                      className="rounded-full px-4"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-border/80 bg-card/95 p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Ready to checkout</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Confirm your cart, then continue to payment to place the order.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dishes</span>
                <span className="font-medium">{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available now</span>
                <span className="font-medium">{availableItems}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unavailable</span>
                <span className="font-medium">{unavailableItems}</span>
              </div>
              <div className="border-t border-border/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-2xl font-semibold tracking-tight">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="mt-6 w-full justify-between rounded-2xl px-5">
              <Link href="/order">
                Continue to payment
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="mt-3 w-full rounded-2xl">
              <Link href="/menu">Add more dishes</Link>
            </Button>
          </aside>
        </section>
      )}
      </div>
    </main>
  );
}
