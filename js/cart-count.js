import { getCart } from "./cart.js";

const cartLinks = document.querySelectorAll(".button-cart");

// Create a badge only if the cart link does not already have one.
cartLinks.forEach((link) => {
  if (!link.querySelector(".cart-badge")) {
    const badge = document.createElement("span");
    badge.classList.add("cart-badge");
    badge.setAttribute("aria-hidden", "true");
    badge.hidden = true;

    link.append(badge);
  }
});

function updateCartCount() {
  try {
    const cart = getCart();

    // Count all quantities, including multiple jackets in the same cart item.
    const totalQuantity = cart.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    cartLinks.forEach((link) => {
      const badge = link.querySelector(".cart-badge");

      badge.textContent = totalQuantity;
      badge.hidden = totalQuantity === 0;

      link.setAttribute(
        "aria-label",
        `Cart, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`,
      );
    });
  } catch {
    cartLinks.forEach((link) => {
      link.querySelector(".cart-badge").hidden = true;
      link.setAttribute("aria-label", "Cart");
    });
  }
}

window.addEventListener("cart-updated", updateCartCount);

// Update the count when cart storage changes in another browser tab.
window.addEventListener("storage", (event) => {
  if (event.key === "rainyDaysCart" || event.key === null) {
    updateCartCount();
  }
});

// Refresh the count when returning through browser history.
window.addEventListener("pageshow", updateCartCount);

updateCartCount();
