import { auth } from "@/auth";
import {
  finalizePaidOrder,
  findExistingOrderByPaypalOrderId,
} from "@/lib/checkout";
import { getPaypalAccessToken, paypalRequest } from "@/lib/paypal";
import { sendPaidOrderConfirmationEmail } from "@/lib/email";
import { after } from "next/server";

type CapturePaypalOrderResponse = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?._id) {
    return Response.json({ message: "You must be logged in to finish payment." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      slugs?: string[];
      paypalOrderId?: string;
    };
    const paypalOrderId = String(body.paypalOrderId ?? "");

    if (!paypalOrderId) {
      throw new Error("PayPal order id is required.");
    }

    const existingOrder = await findExistingOrderByPaypalOrderId(paypalOrderId);

    if (existingOrder?._id) {
      return Response.json({
        orderId: existingOrder._id,
        redirectPath: `/user/${existingOrder.user?._id ?? session.user._id}`,
        alreadyRecorded: true,
      });
    }

    const accessToken = await getPaypalAccessToken();
    
    console.log(`Attempting to capture PayPal order: ${paypalOrderId}`);
    
    const capture = await paypalRequest<CapturePaypalOrderResponse>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        accessToken,
      },
    );
    
    console.log("PayPal capture response:", JSON.stringify(capture, null, 2));

    const completedCapture = capture.purchase_units?.[0]?.payments?.captures?.[0];

    if (capture.status !== "COMPLETED" || !completedCapture?.id) {
      throw new Error(`PayPal payment was not completed. Status: ${capture.status}, Capture ID: ${completedCapture?.id ?? 'missing'}`);
    }

    const result = await finalizePaidOrder({
      slugs: body.slugs ?? [],
      paypalOrderId,
      paypalCaptureId: completedCapture.id,
    });

    if (!result.alreadyRecorded) {
      after(async () => {
        try {
          await sendPaidOrderConfirmationEmail(result.orderId);
        } catch (error) {
          console.error("Failed to send payment confirmation email:", error);
        }
      });
    }

    return Response.json({
      orderId: result.orderId,
      redirectPath: `/user/${result.userId}`,
      alreadyRecorded: result.alreadyRecorded,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to capture the PayPal order.";

    return Response.json({ message }, { status: 400 });
  }
}
