'use server'

import { auth } from "@/auth";
import { ORDER_DISHES_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type OrderDish = {
    _id: string;
    slug: string;
    price?: number;
};

export async function ConfirmOrder(slugs: string[]) {
    const session = await auth();

    if (!session?.user?._id) {
        throw new Error("You must be logged in to confirm an order.");
    }

    if (!Array.isArray(slugs) || slugs.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const normalizedSlugs = slugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0);

    if (normalizedSlugs.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const uniqueSlugs = [...new Set(normalizedSlugs)];
    const dishes = await writeClient.fetch<OrderDish[]>(ORDER_DISHES_QUERY, { slugs: uniqueSlugs });
    const dishesBySlug = new Map(dishes.map((dish) => [dish.slug, dish]));

    const itemCounts = new Map<string, number>();

    for (const slug of normalizedSlugs) {
        if (!dishesBySlug.has(slug)) {
            continue;
        }

        itemCounts.set(slug, (itemCounts.get(slug) ?? 0) + 1);
    }

    const items = Array.from(itemCounts.entries())
        .map(([slug, quantity]) => {
            const dish = dishesBySlug.get(slug);

            if (!dish) {
                return null;
            }

            return {
                _key: `${dish._id}-${slug}`,
                dish: {
                    _type: "reference",
                    _ref: dish._id,
                },
                quantity,
            };
        })
        .filter((item) => item !== null);

    if (items.length === 0) {
        throw new Error("No valid dishes were found in the cart.");
    }

    const totalPrice = normalizedSlugs.reduce((total, slug) => {
        const dish = dishesBySlug.get(slug);
        return total + (dish?.price ?? 0);
    }, 0);

    const order = await writeClient.create({
        _type: "orders",
        user: {
            _type: "reference",
            _ref: session.user._id,
        },
        items,
        totalPrice,
        status: "pending",
    });

    return {
        orderId: order._id,
    };
}
