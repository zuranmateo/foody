"use client";

import ReceiptDownloadButton from "@/components/receipt/ReceiptDownloadButton";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ClearCartFromLocalStorage, GetCartItemsFromLocalStorage } from "@/lib/actions";

type CheckoutPreview = {
  items: Array<{
    slug: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalPrice: number;
  currencyCode: string;
  ingredientUsage: Array<{
    ingredientId: string;
    name: string;
    unit?: string;
    required: number;
    available: number;
  }>;
};

type PaypalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => void;
};

type PaypalNamespace = {
  Buttons: (config: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID?: string }) => Promise<void>;
    onError: (error: unknown) => void;
    onCancel?: () => void;
  }) => PaypalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PaypalNamespace;
  }
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function formatPrice(value: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

async function postJson<T>(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed.");
  }

  return data as T;
}

export default function PaypalCheckout() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [summary, setSummary] = useState<CheckoutPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const paypalButtonsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cartSlugs = GetCartItemsFromLocalStorage();
    setSlugs(cartSlugs);

    if (!cartSlugs.length) {
      setLoading(false);
      setMessage("Your cart is empty.");
      return;
    }

    let cancelled = false;

    const loadSummary = async () => {
      try {
        const preview = await postJson<CheckoutPreview>("/api/checkout/preview", {
          slugs: cartSlugs,
        });

        if (!cancelled) {
          setSummary(preview);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "Unable to load checkout.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      setMessage(
        "PayPal is not configured yet. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET first.",
      );
      return;
    }

    if (window.paypal) {
      setScriptReady(true);
      return;
    }
    
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID,
    )}&currency=EUR&intent=capture`;
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () =>
      setMessage("PayPal SDK failed to load. Please refresh and try again.");
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !summary || !paypalButtonsRef.current || successOrderId) {
      return;
    }

    const paypal = window.paypal;

    if (!paypal) {
      return;
    }

    paypalButtonsRef.current.innerHTML = "";

    const buttons = paypal.Buttons({
      createOrder: async () => {
        setMessage(null);
        setPaying(true);

        try {
          const response = await postJson<{ id: string }>(
            "/api/paypal/create-order",
            { slugs },
          );
          return response.id;
        } catch (error) {
          setPaying(false);
          throw error;
        }
      },
      onApprove: async (data) => {
        try {
          const response = await postJson<{
            orderId: string;
            redirectPath: string;
          }>("/api/paypal/capture-order", {
            slugs,
            paypalOrderId: data.orderID,
          });

          ClearCartFromLocalStorage();
          setSuccessOrderId(response.orderId);
          setRedirectPath(response.redirectPath);
          setMessage("Payment completed and your order was saved.");
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Payment succeeded but the order could not be saved.",
          );
        } finally {
          setPaying(false);
        }
      },
      onError: (error) => {
        setPaying(false);
        setMessage(error instanceof Error ? error.message : "PayPal checkout failed.");
      },
      onCancel: () => {
        setPaying(false);
        setMessage("PayPal payment was cancelled.");
      },
    });

    void buttons.render(paypalButtonsRef.current);

    return () => {
      buttons.close?.();
    };
  }, [scriptReady, slugs, successOrderId, summary]);

  if (loading) {
    return <p>Loading checkout...</p>;
  }

  if (!summary) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-3xl border p-6">
        <p>{message ?? "Unable to load checkout."}</p>
        <Link href="/cart" className="w-fit rounded-2xl border px-4 py-2">
          Back to cart
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Review and pay for your order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ingredient quantities are checked on the server before payment is created and again before the final order is saved.
        </p>

        <div className="mt-6 space-y-4">
          {summary.items.map((item) => (
            <article
              key={item.slug}
              className="rounded-2xl border border-border/80 bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatPrice(item.unitPrice, summary.currencyCode)}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.lineTotal, summary.currencyCode)}
                </p>
              </div>
            </article>
          ))}
        </div>

        {summary.ingredientUsage.length ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-medium">Stock that will be consumed after payment</p>
            <div className="mt-3 space-y-2">
              {summary.ingredientUsage.map((ingredient) => (
                <p key={ingredient.ingredientId}>
                  {ingredient.name}: {ingredient.required}
                  {ingredient.unit ? ` ${ingredient.unit}` : ""} needed,{" "}
                  {ingredient.available}
                  {ingredient.unit ? ` ${ingredient.unit}` : ""} currently in stock
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <aside className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Payment
        </p>
        <p className="mt-2 text-4xl font-semibold">
          {formatPrice(summary.totalPrice, summary.currencyCode)}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          This page uses the PayPal Sandbox developer API. Real money is not charged while you are testing with sandbox accounts.
        </p>

        {message ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            {message}
          </div>
        ) : null}

        {successOrderId ? (
          <div className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-medium">Order saved successfully.</p>
            <p className="text-sm">Order id: {successOrderId}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="rounded-2xl bg-foreground px-4 py-2 text-background">
                Back to menu
              </Link>
              <ReceiptDownloadButton
                orderId={successOrderId}
                label="Save PDF receipt"
                className="rounded-2xl"
              />
              {redirectPath ? (
                <Link href={redirectPath} className="rounded-2xl border px-4 py-2">
                  View my orders
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div ref={paypalButtonsRef} />
            <Link href="/cart" className="inline-flex rounded-2xl border px-4 py-2 text-sm">
              Back to cart
            </Link>
            {paying ? (
              <p className="text-sm text-muted-foreground">Waiting for PayPal...</p>
            ) : null}
          </div>
        )}
      </aside>
    </section>
  );
}
