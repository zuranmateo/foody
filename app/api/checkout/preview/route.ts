import { auth } from "@/auth";
import {
  assertCheckoutCanProceed,
  buildCheckoutPreview,
} from "@/lib/checkout";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?._id) {
    return Response.json({ message: "You must be logged in to continue." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slugs?: string[] };
    const preview = await buildCheckoutPreview(body.slugs ?? []);
    assertCheckoutCanProceed(preview);

    return Response.json(preview);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load the checkout summary.";

    return Response.json({ message }, { status: 400 });
  }
}
