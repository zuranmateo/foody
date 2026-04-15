"use client";

import { startTransition, useMemo, useState } from "react";

type UserSummary = {
    _id?: string;
    name?: string;
    surname?: string;
    email?: string;
};

type AdminUser = UserSummary & {
    _id: string;
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
        _id?: string;
        name?: string;
        surname?: string;
        email?: string;
    };
};

type AdminContactEmailFormProps = {
    users: AdminUser[];
    recentEmails: SentEmail[];
};

const MAX_RESULTS = 8;

function getUserLabel(user: UserSummary) {
    return [user.name, user.surname].filter(Boolean).join(" ") || user.email || "Unknown user";
}

export default function AdminContactEmailForm({
    users,
    recentEmails,
}: AdminContactEmailFormProps) {
    const [query, setQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [state, setState] = useState<{
        status: "idle" | "loading" | "success" | "error";
        message: string;
    }>({ status: "idle", message: "" });

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return [];
        }

        return users
            .filter((user) => {
                const haystack = `${user.name ?? ""} ${user.surname ?? ""} ${user.email ?? ""}`.toLowerCase();
                return haystack.includes(normalizedQuery);
            })
            .slice(0, MAX_RESULTS);
    }, [query, users]);

    const selectedUser = users.find((user) => user._id === selectedUserId) ?? null;

    function handleSelectUser(user: AdminUser) {
        setSelectedUserId(user._id);
        setQuery(getUserLabel(user));
        setState({ status: "idle", message: "" });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedUser?.email) {
            setState({
                status: "error",
                message: "Select a user with a valid email address first.",
            });
            return;
        }

        if (!subject.trim() || !message.trim()) {
            setState({
                status: "error",
                message: "Subject and message are required.",
            });
            return;
        }

        setState({
            status: "loading",
            message: "Sending email...",
        });

        startTransition(async () => {
            try {
                const response = await fetch("/api/admin/send-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: selectedUser._id,
                        subject,
                        message,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to send email.");
                }

                setState({
                    status: "success",
                    message: `Email sent to ${selectedUser.email}.`,
                });
                setSubject("");
                setMessage("");
            } catch (error) {
                setState({
                    status: "error",
                    message: error instanceof Error ? error.message : "Failed to send email.",
                });
            }
        });
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border p-5">
                <h3 className="text-lg font-semibold">Find a user</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Search by name or email, then choose the recipient.
                </p>

                <label className="mt-4 block space-y-2 text-sm">
                    <span className="text-muted-foreground">Search users</span>
                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setSelectedUserId("");
                        }}
                        placeholder="Start typing a name or email"
                        className="w-full rounded-2xl border bg-background px-3 py-2"
                    />
                </label>

                <div className="mt-4 space-y-2">
                    {query.trim().length === 0 ? (
                        <p className="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                            Start typing to see matching users.
                        </p>
                    ) : filteredUsers.length ? (
                        filteredUsers.map((user) => {
                            const isSelected = user._id === selectedUserId;

                            return (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => handleSelectUser(user)}
                                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                                        isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"
                                    }`}
                                >
                                    <span>
                                        <span className="block font-medium">{getUserLabel(user)}</span>
                                        <span className="text-sm text-muted-foreground">{user.email}</span>
                                    </span>
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {user.role || "user"}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                            No users match your search.
                        </p>
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="rounded-3xl border p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Compose email</h3>
                            <p className="text-sm text-muted-foreground">
                                The selected user&apos;s email is filled automatically.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-muted/40 px-4 py-3 text-sm">
                            <p className="text-muted-foreground">Recipient</p>
                            <p className="font-medium">{selectedUser?.email || "No user selected"}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <label className="block space-y-2 text-sm">
                            <span className="text-muted-foreground">Subject</span>
                            <input
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                maxLength={120}
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                                required
                            />
                        </label>

                        <label className="block space-y-2 text-sm">
                            <span className="text-muted-foreground">Message</span>
                            <textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                rows={8}
                                maxLength={4000}
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                                required
                            />
                        </label>

                        {state.status !== "idle" ? (
                            <p
                                className={`rounded-2xl px-4 py-3 text-sm ${
                                    state.status === "success"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : state.status === "error"
                                          ? "bg-red-50 text-red-700"
                                          : "bg-muted/50 text-muted-foreground"
                                }`}
                            >
                                {state.message}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={state.status === "loading"}
                            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                        >
                            {state.status === "loading" ? "Sending..." : "Send email"}
                        </button>
                    </form>
                </div>

                <div className="rounded-3xl border p-5">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold">Recent emails</h3>
                        <p className="text-sm text-muted-foreground">Last {recentEmails.length} sent</p>
                    </div>

                    {recentEmails.length ? (
                        <div className="mt-4 space-y-3">
                            {recentEmails.map((email) => (
                                <article key={email._id} className="rounded-2xl border bg-muted/20 p-4 text-sm">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="font-medium">{email.subject}</p>
                                        <p className="text-muted-foreground">
                                            {new Date(email.sentAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="mt-2 text-muted-foreground">To: {email.to}</p>
                                    <p className="mt-1 text-muted-foreground">
                                        User: {email.user ? getUserLabel(email.user) : "No linked user"}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                            No admin emails have been recorded yet.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
