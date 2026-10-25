import { getCart } from "./cart.js";

const cartLinks = document.querySelectorAll(".button-cart");

cartLinks.forEach((link) => {
  if (!link.querySelector(".cart-badge")) {
    const bagde = document.createElement("span");
    bagde.classList.add("cart-badge");
    bagde.setAttribute("aria-hidden", "true");
    bagde.hidden = true;

    link.append(bagde);
  }
});

function updateCartCount() {
  try {
    const cart = getCart();

    const totalQuantity = cart.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    cartLinks.forEach((link) => {
      const bagde = link.querySelector(".cart-badge");

      bagde.textContent = totalQuantity;
      bagde.hidden = totalQuantity === 0;

      link.setAttribute(
        "aria-label",
        `Cart, ${totalQuantity} ${totalQuantity === 1 ? "item" : "item"}`,
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

window.addEventListener("storage", (event) => {
  if (event.key === "rainyDaysCart" || event.key === null) {
    updateCartCount();
  }
});

window.addEventListener("pageshow", updateCartCount);

updateCartCount();
