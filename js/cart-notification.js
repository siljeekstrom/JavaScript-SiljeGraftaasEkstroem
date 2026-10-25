import { priceFormatter } from "./utils.js";

let notification;
let returnFocusElement;
let dismissTimer;

function scheduleDismiss() {
  clearTimeout(dismissTimer);

  dismissTimer = setTimeout(() => {
    const isHovered = notification.matches("hover");
    const hasFocus = notification.contains(document.activeElement);

    if (!isHovered && !hasFocus) {
      notification.hidden = true;
    }
  }, 2000);
}

export function showCartNotification(product) {
  if (!notification) {
    notification = document.createElement("aside");
    notification.classList.add("cart-notification");
    notification.setAttribute("aria-label", "Added to cart");

    document.body.append(notification);

    notification.addEventListener("mouseenter", () => {
      clearTimeout(dismissTimer);
    });

    notification.addEventListener("mouseleave", scheduleDismiss);

    notification.addEventListener("focusin", () => {
      clearTimeout(dismissTimer);
    });

    notification.addEventListener("focusout", scheduleDismiss);
  }

  returnFocusElement = document.activeElement;
  notification.replaceChildren();

  function closeNotification() {
    clearTimeout(dismissTimer);
    notification.hidden = true;
    returnFocusElement?.focus({ preventScroll: true });
  }

  notification.onkeydown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeNotification();
    }
  };

  const heading = document.createElement("p");
  heading.classList.add("cart-notification-heading");
  heading.textContent = "Added to your cart";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("cart-notification-close");
  closeButton.setAttribute("aria-label", "Close cart notification");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeNotification);

  const image = document.createElement("img");
  image.src = product.image.url;
  image.alt = "";

  const info = document.createElement("div");

  const name = document.createElement("p");
  name.classList.add("cart-notification-name");
  name.textContent = product.title.replace(/^Rainy Days\s+/i, "");

  const price = document.createElement("p");

  const unitPrice =
    product.onSale && product.discountedPrice < product.price
      ? product.discountedPrice
      : product.price;

  price.textContent = priceFormatter.format(unitPrice);

  info.append(name, price);

  const productDetails = document.createElement("div");
  productDetails.classList.add("cart-notification-product");
  productDetails.append(image, info);

  const cartLink = document.createElement("a");
  cartLink.classList.add("cart-notification-link");
  cartLink.href = new URL("../checkout/index.html", import.meta.url).href;
  cartLink.textContent = "View cart";

  notification.append(heading, closeButton, productDetails, cartLink);
  notification.hidden = false;
  scheduleDismiss();
}
