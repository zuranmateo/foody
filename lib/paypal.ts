import "server-only";

const PAYPAL_API_BASE_URL = "https://api-m.sandbox.paypal.com";

function getPaypalConfig() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Add your PayPal Sandbox credentials to `.env.local`:
    // NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-sandbox-client-id"
    // PAYPAL_CLIENT_SECRET="your-sandbox-secret"
    // Create them at https://developer.paypal.com/dashboard/applications and keep the secret server-only.
    throw new Error(
      "PayPal is not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local.",
    );
  }

  return { clientId, clientSecret };
}

export function getPaypalClientId() {
  return getPaypalConfig().clientId;
}

export async function getPaypalAccessToken() {
  const { clientId, clientSecret } = getPaypalConfig();
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

export async function paypalRequest<T>(
  path: string,
  init: RequestInit & { accessToken?: string } = {},
) {
  const accessToken = init.accessToken ?? (await getPaypalAccessToken());
  const response = await fetch(`${PAYPAL_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "PayPal request failed.";

    throw new Error(message);
  }

  return data as T;
}
