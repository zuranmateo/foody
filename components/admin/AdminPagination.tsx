import Link from "next/link";

type AdminPaginationProps = {
    basePath: string;
    currentPage: number;
    totalPages: number;
    params?: Record<string, string | undefined>;
};

function buildHref(
    basePath: string,
    page: number,
    params: Record<string, string | undefined>,
) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            searchParams.set(key, value);
        }
    });

    if (page > 1) {
        searchParams.set("page", String(page));
    }

    const query = searchParams.toString();
    return query ? `${basePath}?${query}` : basePath;
}

export default function AdminPagination({
    basePath,
    currentPage,
    totalPages,
    params = {},
}: AdminPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
        (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
    );

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
            <p className="text-muted-foreground">
                Page {currentPage} of {totalPages}
            </p>
            <div className="flex flex-wrap gap-2">
                <Link
                    href={buildHref(basePath, Math.max(1, currentPage - 1), params)}
                    aria-disabled={currentPage === 1}
                    className={`rounded-2xl border px-4 py-2 ${
                        currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-accent"
                    }`}
                >
                    Previous
                </Link>

                {pageNumbers.map((page, index) => {
                    const previousPage = pageNumbers[index - 1];
                    const showGap = previousPage && page - previousPage > 1;

                    return (
                        <span key={page} className="contents">
                            {showGap ? (
                                <span className="flex items-center px-2 text-muted-foreground">...</span>
                            ) : null}
                            <Link
                                href={buildHref(basePath, page, params)}
                                className={`rounded-2xl px-4 py-2 ${
                                    currentPage === page
                                        ? "bg-primary text-primary-foreground"
                                        : "border hover:bg-accent"
                                }`}
                            >
                                {page}
                            </Link>
                        </span>
                    );
                })}

                <Link
                    href={buildHref(basePath, Math.min(totalPages, currentPage + 1), params)}
                    aria-disabled={currentPage === totalPages}
                    className={`rounded-2xl border px-4 py-2 ${
                        currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-accent"
                    }`}
                >
                    Next
                </Link>
            </div>
        </div>
    );
}
