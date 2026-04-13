const CART_STORAGE_KEY = "cart";

function readCartFromLocalStorage(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    const saved = localStorage.getItem(CART_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        const cart = JSON.parse(saved);

        if (!Array.isArray(cart)) {
            return [];
        }

        return cart
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                if (item && typeof item === "object" && "current" in item && typeof item.current === "string") {
                    return item.current;
                }

                return null;
            })
            .filter((item): item is string => item !== null);
    } catch {
        return [];
    }
}

function writeCartToLocalStorage(cart: string[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
}

export function AddToCart(newItem: string) {
    const cart = readCartFromLocalStorage();
    cart.push(newItem);
    writeCartToLocalStorage(cart);
}

export function GetCartItemsFromLocalStorage() {
    return readCartFromLocalStorage();
}

export function CountCartFromLocalStorage() {
    return readCartFromLocalStorage().length;
}

export function RemoveCartItemFromLocalStorage(indexToRemove: number) {
    const cart = readCartFromLocalStorage();

    if (indexToRemove < 0 || indexToRemove >= cart.length) {
        return cart;
    }

    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    writeCartToLocalStorage(updatedCart);

    return updatedCart;
}
