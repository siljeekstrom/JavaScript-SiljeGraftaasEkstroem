const CART_KEY = "rainyDaysCart";

export function getCart() {
    const storedCart = localStorage.getItem(CART_KEY);

    if (storedCart === null) {
        return [];
    }

    let cart;

    try {
        cart = JSON.parse(storedCart);
    } catch {
        throw new Error("Your saved cart could not be loaded. Please clear your browser data and try again.");
    }

    if (!Array.isArray(cart)) {
        throw new Error("Your saved cart is invalid. Please clear your browser data and try again.");
    }

    const validItems = cart.every((item) => {
        return (
            item !== null &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            item.id.trim() !== "" &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
        );
    });

    if (!validItems) {
        throw new Error("Your saved cart contains invalid items. Please clear your browser data and try again.");
    }

    return cart;
}

export function addToCart(productId) {
    if (typeof productId !== "string" || !productId.trim()) {
        throw new Error("Please select a valid jacket before adding it to your cart.");
    }

    const cart = getCart();

    const existingItem = cart.find((item) => {
        return item.id === productId;
    });

    if (existingItem) {
        if (!Number.isSafeInteger(existingItem.quantity + 1)) {
            throw new Error("You cannot add more of this jacket to your cart.");
        }

        existingItem.quantity += 1;
    } else {
        cart.push({ 
            id: productId, 
            quantity: 1,
        });
    } 
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

    export function removeFromCart(productId) {
        const cart = getCart();

        const updatedCart = cart.filter((item) => {
            return item.id !== productId;
        }); 

       localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}