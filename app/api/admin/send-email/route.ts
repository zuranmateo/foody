import { auth } from "@/auth";
import { buildSimpleHtmlEmail, sendResendEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";
import { client } from "@/sanity/lib/client";
import { USER_BY_ID_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";
import { NextResponse } from "next/server";

type SendEmailPayload = {
  subject?: string;
  message?: string;
  userId?: string;
};

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let payload: SendEmailPayload;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const subject = String(payload.subject ?? "").trim();
    const message = String(payload.message ?? "").trim();
    const userId = String(payload.userId ?? "").trim();

    if (!userId || !subject || !message) {
        return NextResponse.json(
            { error: "Recipient, subject, and message are required." },
            { status: 400 },
        );
    }

    if (subject.length > 120) {
        return NextResponse.json({ error: "Subject is too long." }, { status: 400 });
    }

    if (message.length > 4000) {
        return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const user = await client.fetch<{
        _id: string;
        email?: string;
        name?: string;
        surname?: string;
    } | null>(USER_BY_ID_QUERY, { id: userId });

    if (!user) {
        return NextResponse.json({ error: "Selected user was not found." }, { status: 404 });
    }

    const to = String(user.email ?? "").trim().toLowerCase();

    if (!isValidEmail(to)) {
        return NextResponse.json({ error: "Selected user does not have a valid email." }, { status: 400 });
    }

    let resendResult: { id?: string };

    try {
        resendResult = await sendResendEmail({
            to,
            subject,
            text: message,
            html: buildSimpleHtmlEmail("Foody admin message", subject, message),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Resend could not send the email.",
            },
            { status: 502 },
        );
    }

    await writeClient.create({
        _type: "sentEmails",
        admin: {
            _type: "reference",
            _ref: session.user._id,
        },
        user: userId
            ? {
                  _type: "reference",
                  _ref: userId,
              }
            : undefined,
        to,
        subject,
        message,
        status: "sent",
        resendId: resendResult.id,
        sentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: resendResult.id });
}
