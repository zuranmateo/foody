import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin-actions";
import { SanityLive } from "@/sanity/lib/live";

export default async function ControlLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await requireAdmin();

    return (
        <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-7xl px-4 py-6 lg:px-6">
            <div className="flex justify-between">
                <AdminSidebar />
                <section className="w-full rounded-3xl border bg-card p-5 shadow-sm lg:p-8">
                    <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                                Admin area
                            </p>
                            <h1 className="text-2xl font-semibold">Foody control</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Signed in as {session.user.name ?? session.user.email ?? "admin"}
                        </p>
                    </div>
                    {children}
                </section>
            </div>
            <SanityLive />
        </main>
    );
}
