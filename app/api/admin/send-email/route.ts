import { auth } from "@/auth";
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

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildHtmlEmail(subject: string, message: string) {
    const escapedSubject = escapeHtml(subject);
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
            <p style="margin-bottom: 16px; color: #6b7280;">Foody admin message</p>
            <h1 style="font-size: 24px; margin-bottom: 16px;">${escapedSubject}</h1>
            <div style="font-size: 16px;">${escapedMessage}</div>
        </div>
    `;
}

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

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json(
            { error: "RESEND_API_KEY is not configured." },
            { status: 500 },
        );
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "Foody <onboarding@resend.dev>",
            to: [to],
            subject,
            html: buildHtmlEmail(subject, message),
        }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
        return NextResponse.json(
            {
                error:
                    resendResult?.message ||
                    resendResult?.error?.message ||
                    "Resend could not send the email.",
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
        resendId: resendResult?.id,
        sentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: resendResult?.id });
}
