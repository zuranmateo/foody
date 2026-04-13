"use client"

import { useEffect, useState } from "react";
import { GetCartItemsFromLocalStorage, RemoveCartItemFromLocalStorage } from "@/lib/actions";
import { client } from "@/sanity/lib/client";
import { CART_DISHES_QUERY } from "@/sanity/lib/query";

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

  return (
    <main className="main">
      <h1>Cart</h1>

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {cartItems.map(({ cartIndex, dish }) => (
            <div key={`${dish._id}-${cartIndex}`} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2>{dish.name}</h2>
                  <p>{dish.category}</p>
                  {dish.description ? <p>{dish.description}</p> : null}
                  <p>{dish.price} EUR</p>
                  <p>{dish.isAvailable ? "Available" : "Not available"}</p>
                </div>

                <button onClick={() => handleRemove(cartIndex)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
