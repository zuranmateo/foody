import { clampPage } from "@/lib/validation";

export const ADMIN_PAGE_SIZE = 8;

export function getPagination(searchPage: string | undefined, pageSize = ADMIN_PAGE_SIZE) {
    const page = clampPage(searchPage, 1);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        page,
        pageSize,
        start,
        end,
    };
}

export function getTotalPages(totalItems: number, pageSize = ADMIN_PAGE_SIZE) {
    return Math.max(1, Math.ceil(totalItems / pageSize));
}
