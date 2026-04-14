import { auth } from "@/auth";
import {
  assertCheckoutCanProceed,
  buildCheckoutPreview,
  formatMoneyForPaypal,
} from "@/lib/checkout";
import { getPaypalAccessToken, paypalRequest } from "@/lib/paypal";

type CreatePaypalOrderResponse = {
  id?: string;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?._id) {
    return Response.json({ message: "You must be logged in to pay." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slugs?: string[] };
    const preview = await buildCheckoutPreview(body.slugs ?? []);
    assertCheckoutCanProceed(preview);
    
    // Compute exact items total to match PayPal requirement: sum(items) == total
    const itemsTotal = preview.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const formattedItemsTotal = formatMoneyForPaypal(itemsTotal);
    
    const accessToken = await getPaypalAccessToken();

    // Remove duplicate declarations
    const requestBody = {
      intent: "CAPTURE",
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart`,
      },
      payment_method: {
        payee_preferred: "UNRESTRICTED",
      },
      purchase_units: [
        {
          reference_id: `foody-checkout-${Date.now()}`,
          description: "Foody order",
          amount: {
            currency_code: preview.currencyCode,
            value: formattedItemsTotal,
            breakdown: {
              item_total: {
                currency_code: preview.currencyCode,
                value: formattedItemsTotal
              }
            }
          },
          items: preview.items.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: preview.currencyCode,
              value: formatMoneyForPaypal(item.unitPrice),
            },
            category: "PHYSICAL_GOODS"
          })),
        },
      ],
    };
    
    console.log("PayPal create-order request body:", JSON.stringify(requestBody, null, 2));
    
    const paypalOrder = await paypalRequest<CreatePaypalOrderResponse>(
      "/v2/checkout/orders",
      {
        method: "POST",
        accessToken,
        body: JSON.stringify(requestBody),
      },
    );

    if (!paypalOrder.id) {
      throw new Error("PayPal did not return an order id.");
    }

    return Response.json({ id: paypalOrder.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the PayPal order.";

    return Response.json({ message }, { status: 400 });
  }
}
