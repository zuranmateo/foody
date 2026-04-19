import type { ReactNode } from "react";

type GraphCardProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
};

export default function GraphCard({ title, description, action, children }: GraphCardProps) {
    return (
        <article className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {action}
            </div>
            <div className="mt-5">{children}</div>
        </article>
    );
}
