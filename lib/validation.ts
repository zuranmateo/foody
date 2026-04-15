export function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function clampPage(value: string | undefined, fallback = 1) {
    const page = Number.parseInt(value ?? "", 10);

    if (!Number.isFinite(page) || page < 1) {
        return fallback;
    }

    return page;
}

export function normalizeText(
    value: FormDataEntryValue | string | null | undefined,
    maxLength: number,
) {
    const text = String(value ?? "").trim();

    if (text.length === 0) {
        return "";
    }

    return text.slice(0, maxLength);
}
