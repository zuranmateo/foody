import "server-only";

import { auth } from "@/auth";
import {
  CHECKOUT_DISHES_QUERY,
  ORDER_BY_PAYPAL_ORDER_ID_QUERY,
} from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

type CheckoutDishIngredient = {
  quantity?: number;
  ingredient?: {
    _id: string;
    _rev?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    inStock?: boolean;
  };
};

type CheckoutDish = {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  isAvailable?: boolean;
  ingredients?: CheckoutDishIngredient[];
};

export type CheckoutPreviewItem = {
  dishId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type AggregatedIngredientNeed = {
  ingredientId: string;
  revision?: string;
  name: string;
  unit?: string;
  required: number;
  available: number;
  inStock: boolean;
};

export type CheckoutPreview = {
  normalizedSlugs: string[];
  items: CheckoutPreviewItem[];
  totalPrice: number;
  currencyCode: "EUR";
  ingredientUsage: AggregatedIngredientNeed[];
};

function normalizeCartSlugs(slugs: string[]) {
  if (!Array.isArray(slugs)) {
    return [];
  }

  return slugs.filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function formatMoneyForPaypal(value: number) {
  return roundMoney(value).toFixed(2);
}

export async function buildCheckoutPreview(slugs: string[]): Promise<CheckoutPreview> {
  const normalizedSlugs = normalizeCartSlugs(slugs);

  if (normalizedSlugs.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const uniqueSlugs = [...new Set(normalizedSlugs)];
  const dishes = await writeClient.fetch<CheckoutDish[]>(CHECKOUT_DISHES_QUERY, {
    slugs: uniqueSlugs,
  });
  const dishesBySlug = new Map(dishes.map((dish) => [dish.slug, dish]));
  const itemCounts = new Map<string, number>();

  for (const slug of normalizedSlugs) {
    const dish = dishesBySlug.get(slug);

    if (!dish) {
      throw new Error(`Dish "${slug}" was not found anymore.`);
    }

    if (dish.isAvailable === false) {
      throw new Error(`${dish.name} is currently not available.`);
    }

    itemCounts.set(slug, (itemCounts.get(slug) ?? 0) + 1);
  }

  const items: CheckoutPreviewItem[] = [];
  const ingredientUsageMap = new Map<string, AggregatedIngredientNeed>();

  for (const [slug, quantity] of itemCounts.entries()) {
    const dish = dishesBySlug.get(slug);

    if (!dish) {
      continue;
    }

    const unitPrice = roundMoney(dish.price ?? 0);
    items.push({
      dishId: dish._id,
      slug,
      name: dish.name,
      quantity,
      unitPrice,
      lineTotal: roundMoney(unitPrice * quantity),
    });

    for (const ingredientItem of dish.ingredients ?? []) {
      const ingredient = ingredientItem.ingredient;

      if (!ingredient?._id) {
        continue;
      }

      const perDishQuantity = Number(ingredientItem.quantity ?? 0);
      const required = roundMoney(perDishQuantity * quantity);
      const existing = ingredientUsageMap.get(ingredient._id);

      if (existing) {
        existing.required = roundMoney(existing.required + required);
        continue;
      }

      ingredientUsageMap.set(ingredient._id, {
        ingredientId: ingredient._id,
        revision: ingredient._rev,
        name: ingredient.name ?? "Ingredient",
        unit: ingredient.unit,
        required,
        available: Number(ingredient.quantity ?? 0),
        inStock: ingredient.inStock !== false,
      });
    }
  }

  const totalPrice = roundMoney(
    items.reduce((sum, item) => sum + item.lineTotal, 0),
  );

  return {
    normalizedSlugs,
    items,
    totalPrice,
    currencyCode: "EUR",
    ingredientUsage: Array.from(ingredientUsageMap.values()),
  };
}

export function assertCheckoutCanProceed(preview: CheckoutPreview) {
  if (!preview.items.length) {
    throw new Error("Your cart is empty.");
  }

  const insufficientIngredients = preview.ingredientUsage.filter(
    (ingredient) =>
      !ingredient.inStock || ingredient.available < ingredient.required,
  );

  if (insufficientIngredients.length > 0) {
    const firstIngredient = insufficientIngredients[0];
    const unit = firstIngredient.unit ? ` ${firstIngredient.unit}` : "";

    throw new Error(
      `${firstIngredient.name} does not have enough stock. Required ${firstIngredient.required}${unit}, available ${firstIngredient.available}${unit}.`,
    );
  }
}

export async function findExistingOrderByPaypalOrderId(paypalOrderId: string) {
  if (!paypalOrderId) {
    return null;
  }

  return writeClient.fetch<{
    _id: string;
    user?: { _id?: string };
  } | null>(ORDER_BY_PAYPAL_ORDER_ID_QUERY, {
    paypalOrderId,
  });
}

export async function finalizePaidOrder(params: {
  slugs: string[];
  paypalOrderId: string;
  paypalCaptureId: string;
}) {
  const session = await auth();

  if (!session?.user?._id) {
    throw new Error("You must be logged in to complete the order.");
  }

  const existingOrder = await findExistingOrderByPaypalOrderId(params.paypalOrderId);

  if (existingOrder?._id) {
    return {
      orderId: existingOrder._id,
      userId: existingOrder.user?._id ?? session.user._id,
      alreadyRecorded: true,
    };
  }

  const preview = await buildCheckoutPreview(params.slugs);
  assertCheckoutCanProceed(preview);

  const orderId = `order-${crypto.randomUUID()}`;
  const transaction = writeClient.transaction();

  for (const ingredient of preview.ingredientUsage) {
    const nextQuantity = roundMoney(ingredient.available - ingredient.required);

    transaction.patch(ingredient.ingredientId, (patch) => {
      const nextPatch = patch.set({
        quantity: nextQuantity,
        inStock: nextQuantity > 0,
      });

      return ingredient.revision ? nextPatch.ifRevisionId(ingredient.revision) : nextPatch;
    });
  }

  transaction.create({
    _id: orderId,
    _type: "orders",
    user: {
      _type: "reference",
      _ref: session.user._id,
    },
    items: preview.items.map((item) => ({
      _key: `${item.dishId}-${item.slug}`,
      dish: {
        _type: "reference",
        _ref: item.dishId,
      },
      quantity: item.quantity,
    })),
    totalPrice: preview.totalPrice,
    status: "pending",
    paymentProvider: "paypal",
    paymentStatus: "completed",
    paypalOrderId: params.paypalOrderId,
    paypalCaptureId: params.paypalCaptureId,
    paidAt: new Date().toISOString(),
  });

  await transaction.commit();

  revalidatePath("/control/orders");
  revalidatePath("/control/dashboard");
  revalidatePath("/control/ingredients");
  revalidatePath(`/user/${session.user._id}`);

  return {
    orderId,
    userId: session.user._id,
    alreadyRecorded: false,
  };
}
