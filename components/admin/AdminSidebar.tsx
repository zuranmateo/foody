'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/control/dashboard", label: "Dashboard" },
    { href: "/control/orders", label: "Orders" },
    { href: "/control/ingredients", label: "Ingredients" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full rounded-3xl border bg-card p-4 shadow-sm lg:sticky lg:top-6 lg:w-64 lg:self-start">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Control panel
            </p>
            <nav className="mt-4 flex flex-col gap-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`rounded-2xl px-4 py-3 text-sm transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/60 text-foreground hover:bg-accent"
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
