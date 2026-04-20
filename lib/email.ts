import "server-only";

import { ORDER_RECEIPT_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";
import { isValidEmail } from "./validation";
import type { ReceiptOrder } from "./receipt";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value.toFixed(2)));
}

function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Ljubljana",
  }).format(date);
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export function buildSimpleHtmlEmail(preheader: string, subject: string, message: string) {
  const escapedPreheader = escapeHtml(preheader);
  const escapedSubject = escapeHtml(subject);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
      <p style="margin-bottom: 16px; color: #6b7280;">${escapedPreheader}</p>
      <h1 style="font-size: 24px; margin-bottom: 16px;">${escapedSubject}</h1>
      <div style="font-size: 16px;">${escapedMessage}</div>
    </div>
  `;
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Foody <onboarding@resend.dev>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  const resendResult = await resendResponse.json();

  if (!resendResponse.ok) {
    throw new Error(
      resendResult?.message ||
        resendResult?.error?.message ||
        "Resend could not send the email.",
    );
  }

  return {
    id: resendResult?.id as string | undefined,
  };
}

function buildOrderConfirmationText(order: ReceiptOrder) {
  const customerName =
    [order.user?.name, order.user?.surname].filter(Boolean).join(" ") || "customer";
  const lines = [
    `Hello ${customerName},`,
    "",
    `We have received your payment for order ${order._id}.`,
    `Paid at: ${formatDate(order.paidAt)}`,
    `Total: ${formatCurrency(Number(order.totalPrice ?? 0))}`,
    "",
    "Order summary:",
    ...(order.items ?? []).map((item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.dish?.price ?? 0);
      return `- ${item.dish?.name ?? item.dish?.slug ?? "Dish"} x${quantity} (${formatCurrency(unitPrice)})`;
    }),
    "",
    `You can review your order here: ${getBaseUrl()}/user/${order.user?._id ?? ""}`,
    `Receipt download: ${getBaseUrl()}/api/orders/${order._id}/receipt`,
    "",
    "Thank you for ordering with Foody.",
  ];

  return lines.join("\n");
}

function buildOrderConfirmationHtml(order: ReceiptOrder) {
  const customerName =
    [order.user?.name, order.user?.surname].filter(Boolean).join(" ") || "Customer";
  const itemsHtml = (order.items ?? [])
    .map((item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.dish?.price ?? 0);
      const dishName = escapeHtml(item.dish?.name ?? item.dish?.slug ?? "Dish");

      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${dishName}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(formatCurrency(unitPrice))}</td>
        </tr>
      `;
    })
    .join("");

  const accountUrl = `${getBaseUrl()}/user/${order.user?._id ?? ""}`;
  const receiptUrl = `${getBaseUrl()}/api/orders/${order._id}/receipt`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
      <p style="margin-bottom: 16px; color: #6b7280;">Foody payment confirmation</p>
      <h1 style="font-size: 28px; margin-bottom: 16px;">Payment received</h1>
      <p style="font-size: 16px;">Hello ${escapeHtml(customerName)}, your payment for order <strong>${escapeHtml(order._id)}</strong> was completed successfully.</p>
      <div style="margin: 24px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>Paid at:</strong> ${escapeHtml(formatDate(order.paidAt))}</p>
        <p style="margin: 0;"><strong>Total:</strong> ${escapeHtml(formatCurrency(Number(order.totalPrice ?? 0)))}</p>
      </div>
      <h2 style="font-size: 18px; margin: 24px 0 12px;">Order summary</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <thead>
          <tr>
            <th style="padding: 0 0 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Item</th>
            <th style="padding: 0 0 10px; text-align: center; border-bottom: 2px solid #d1d5db;">Qty</th>
            <th style="padding: 0 0 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top: 24px;">
        <a href="${escapeHtml(accountUrl)}" style="display: inline-block; margin-right: 12px; padding: 12px 18px; border-radius: 999px; background: #111827; color: #ffffff; text-decoration: none;">View your account</a>
        <a href="${escapeHtml(receiptUrl)}" style="display: inline-block; padding: 12px 18px; border-radius: 999px; border: 1px solid #d1d5db; color: #111827; text-decoration: none;">Download receipt</a>
      </div>
    </div>
  `;
}

export async function sendPaidOrderConfirmationEmail(orderId: string) {
  const order = await writeClient.fetch<ReceiptOrder | null>(ORDER_RECEIPT_QUERY, { orderId });

  if (!order) {
    throw new Error(`Order ${orderId} was not found for confirmation email.`);
  }

  const to = String(order.user?.email ?? "").trim().toLowerCase();

  if (!isValidEmail(to)) {
    throw new Error(`Order ${orderId} does not have a valid customer email.`);
  }

  const subject = `Payment confirmed for order ${order._id}`;
  const text = buildOrderConfirmationText(order);

  return sendResendEmail({
    to,
    subject,
    text,
    html: buildOrderConfirmationHtml(order),
  });
}
