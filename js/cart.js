const CART_KEY = "rainyDaysCart";

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
    throw new InvalidCartError(
      "Your saved cart contains invalid items. Reset your cart to continue.",
    );
  }

  return cart;
}

export function addToCart(productId) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new Error(
      "Please select a valid jacket before adding it to your cart.",
    );
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

  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(productId) {
  const cart = getCart();

  const updatedCart = cart.filter((item) => {
    return item.id !== productId;
  });

  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));

  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartQuantity(productId, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive whole number");
  }

  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (!item) {
    throw new Error("This jacket is no longer in your cart");
  }

  item.quantity = quantity;

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}
