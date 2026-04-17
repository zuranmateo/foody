import { auth } from "@/auth";
import { buildReceiptFileName, buildReceiptPdf, type ReceiptOrder } from "@/lib/receipt";
import { ORDER_RECEIPT_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();

  if (!session?.user?._id) {
    return Response.json({ message: "You must be logged in to download receipts." }, { status: 401 });
  }

  const { orderId } = await context.params;
  const order = await writeClient.fetch<ReceiptOrder | null>(ORDER_RECEIPT_QUERY, { orderId });

  if (!order) {
    return Response.json({ message: "Receipt was not found." }, { status: 404 });
  }

  const isOwner = order.user?._id === session.user._id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return Response.json({ message: "You are not allowed to access this receipt." }, { status: 403 });
  }

  try {
    const pdf = buildReceiptPdf(order);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${buildReceiptFileName(order._id)}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate the receipt PDF.";

    return Response.json({ message }, { status: 500 });
  }
}
