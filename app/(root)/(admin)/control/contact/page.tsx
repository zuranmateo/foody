import AdminContactEmailForm from "@/components/admin/AdminContactEmailForm";
import { ADMIN_CONTACT_USERS_QUERY, ADMIN_SENT_EMAILS_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type AdminUser = {
    _id: string;
    name?: string;
    surname?: string;
    email?: string;
    role?: string;
};

type SentEmail = {
    _id: string;
    to: string;
    subject: string;
    status?: string;
    sentAt: string;
    admin?: {
        name?: string;
        surname?: string;
        email?: string;
    };
    user?: {
        _id: string;
        name?: string;
        surname?: string;
        email?: string;
    };
};

export default async function ContactUsersPage() {
    const [users, recentEmails] = await Promise.all([
        writeClient.fetch<AdminUser[]>(ADMIN_CONTACT_USERS_QUERY),
        writeClient.fetch<SentEmail[]>(ADMIN_SENT_EMAILS_QUERY),
    ]);

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-xl font-semibold">Contact users</h2>
                <p className="text-sm text-muted-foreground">
                    Search for a user, confirm their email, and send a direct message from the admin panel.
                </p>
            </section>

            <AdminContactEmailForm users={users} recentEmails={recentEmails} />
        </div>
    );
}
