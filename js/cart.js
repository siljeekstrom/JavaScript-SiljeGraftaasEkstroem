const CART_KEY = "rainyDaysCart";

// Let the UI distinguish invalid saved cart data from other errors.
export class InvalidCartError extends Error {}

export function getCart() {
  const storedCart = localStorage.getItem(CART_KEY);

  if (storedCart === null) {
    return [];
  }

  let cart;

  try {
    cart = JSON.parse(storedCart);
  } catch {
    throw new InvalidCartError(
      "Your saved cart could not be read. Reset your cart to continue.",
    );
  }

  if (!Array.isArray(cart)) {
    throw new InvalidCartError(
      "Your saved cart is invalid. Reset your cart to continue.",
    );
  }

  // Validate stored items before allowing cart operations.
  const validItems = cart.every((item) => {
    return (
      item !== null &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      item.id.trim() !== "" &&
      // Allow older cart items without a size; size availability is checked before checkout.
      (item.size === undefined ||
        item.size === null ||
        (typeof item.size === "string" && item.size.trim() !== "")) &&
      Number.isSafeInteger(item.quantity) &&
      item.quantity > 0
    );
  });

  if (!validItems) {
    throw new InvalidCartError(
      "Your saved cart contains invalid items. Reset your cart to continue.",
    );
  }

  return cart;
}

export function addToCart(productId, size = null) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new Error(
      "Please select a valid jacket before adding it to your cart.",
    );
  }

  if (size !== null && (typeof size !== "string" || !size.trim())) {
    throw new Error("Please select a valid size");
  }

  const selectedSize = size === null ? null : size.trim();
  const cart = getCart();

  // Combine quantities only when both the product and selected size match.
  const existingItem = cart.find((item) => {
    return item.id === productId && (item.size ?? null) === selectedSize;
  });

  if (existingItem) {
    if (!Number.isSafeInteger(existingItem.quantity + 1)) {
      throw new Error("You cannot add more of this jacket to your cart.");
    }

    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      size: selectedSize,
      quantity: 1,
    });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  // Notify the current page after saving so the cart badge can update.
  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(productId, size = null) {
  const cart = getCart();

  const updatedCart = cart.filter((item) => {
    const matchesItem = item.id === productId && (item.size ?? null) === size;

    return !matchesItem;
  });

  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));

  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartQuantity(productId, quantity, size = null) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive whole number");
  }

  const cart = getCart();
  const item = cart.find((item) => {
    return item.id === productId && (item.size ?? null) === size;
  });

  if (!item) {
    throw new Error("This jacket is no longer in your cart");
  }

  item.quantity = quantity;

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}
