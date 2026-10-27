import { getProducts } from "./api.js";
import {
  getCart,
  removeFromCart,
  clearCart,
  InvalidCartError,
  updateCartQuantity,
} from "./cart.js";
import { priceFormatter } from "./utils.js";

const cartTitle = document.querySelector("#cart-title");
const loadingMessage = document.querySelector("#cart-loading");
const errorMessage = document.querySelector("#cart-page-error");
const emptyMessage = document.querySelector("#cart-empty");
const cartItems = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const cartTotal = document.querySelector("#cart-total");
const cartItemCount = document.querySelector("#cart-item-count");
const resetCartButton = document.querySelector("#reset-cart");
const checkoutLink = document.querySelector("#checkout-link");

let products = [];

function getUnitPrice(product) {
  if (product.onSale && product.discountedPrice < product.price) {
    return product.discountedPrice;
  }

  return product.price;
}

function createCartItem(item, product) {
  const article = document.createElement("article");
  article.classList.add("cart-item");

  const details = document.createElement("div");
  details.classList.add("cart-item-details");

  const title = document.createElement("h2");
  title.classList.add("cart-item-name");

  if (product) {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("cart-item-image");

    const link = document.createElement("a");
    link.href = `../product/index.html?id=${encodeURIComponent(product.id)}`;

    const image = document.createElement("img");
    image.src = product.image.url;
    image.alt = product.image.alt || product.title;

    link.append(image);
    imageContainer.append(link);
    article.append(imageContainer);

    title.textContent = product.title.replace(/^Rainy Days\s+/i, "");
  } else {
    title.textContent = "Unavailable jacket";
  }

  const itemSize = item.size ?? null;
  const itemLabel = `${title.textContent}, size ${itemSize ?? "not selected"}`;

  const size = document.createElement("p");
  size.classList.add("cart-item-size");

  const hasValidSize =
    product && Array.isArray(product.sizes) && product.sizes.includes(itemSize);

  if (hasValidSize) {
    size.textContent = `Size: ${itemSize}`;
  } else if (product) {
    size.textContent =
      "Size missing or unavailable. Remove this item and choose size on the product page.";
  } else {
    size.textContent = `Size: ${itemSize ?? "Not selected"}`;
  }

  const quantity = document.createElement("div");
  quantity.classList.add("cart-quantity");

  const decreaseButton = document.createElement("button");
  decreaseButton.type = "button";
  decreaseButton.textContent = "-";
  decreaseButton.disabled = item.quantity === 1;
  decreaseButton.setAttribute(
    "aria-label",
    `Decrease quantity of ${itemLabel}`,
  );

  const quantityValue = document.createElement("span");
  quantityValue.textContent = item.quantity;
  quantityValue.setAttribute("aria-label", `Quantity: ${item.quantity}`);

  const increaseButton = document.createElement("button");
  increaseButton.type = "button";
  increaseButton.textContent = "+";
  increaseButton.setAttribute(
    "aria-label",
    `Increase quantity of ${itemLabel}`,
  );

  function changeQuantity(change) {
    errorMessage.hidden = true;

    try {
      // Read the current quantity from storage before updating.
      const currentItem = getCart().find((cartItem) => {
        return cartItem.id === item.id && (cartItem.size ?? null) === itemSize;
      });

      if (!currentItem) {
        throw new Error("This jacket is no longer in your cart.");
      }

      updateCartQuantity(item.id, currentItem.quantity + change, itemSize);
      renderCart();

      const updatedButton = Array.from(
        cartItems.querySelectorAll(".cart-quantity button"),
      ).find((button) => {
        const label =
          change === 1
            ? increaseButton.getAttribute("aria-label")
            : decreaseButton.getAttribute("aria-label");

        return button.getAttribute("aria-label") === label;
      });

      if (updatedButton && !updatedButton.disabled) {
        updatedButton.focus({ preventScroll: true });
      } else {
        cartTitle.focus({ preventScroll: true });
      }
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error
          ? error.message
          : "We could not update the quantity. Please try again.";

      errorMessage.hidden = false;
    }
  }

  decreaseButton.addEventListener("click", () => {
    changeQuantity(-1);
  });

  increaseButton.addEventListener("click", () => {
    changeQuantity(1);
  });

  quantity.append(decreaseButton, quantityValue, increaseButton);

  const price = document.createElement("p");
  price.classList.add("cart-item-price");

  if (product) {
    const unitPrice = getUnitPrice(product);
    const lineTotal = Math.round(unitPrice * 100) * item.quantity;

    const totalPrice = document.createElement("span");
    totalPrice.classList.add("cart-line-total");
    totalPrice.textContent = priceFormatter.format(lineTotal / 100);

    price.append(totalPrice);
  } else {
    price.textContent =
      "This jacket is no longer available. Please remove it from your cart.";
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.classList.add("remove-from-cart");
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", `Remove ${itemLabel}`);

  removeButton.addEventListener("click", () => {
    errorMessage.hidden = true;

    try {
      removeFromCart(item.id, itemSize);
      renderCart();
      cartTitle.focus();
    } catch (error) {
      errorMessage.textContent =
        "We could not update your cart. Please try again.";
      errorMessage.hidden = false;
    }
  });

  details.append(title, size, quantity, price, removeButton);
  article.append(details);

  return article;
}

function renderCart() {
  const cart = getCart();

  const hasInvalidSizes = cart.some((item) => {
    const product = products.find((product) => product.id === item.id);

    return (
      product &&
      (!Array.isArray(product.sizes) || !product.sizes.includes(item.size))
    );
  });

  const totalQuantity = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  cartItemCount.textContent = `(${totalQuantity})`;

  cartItems.replaceChildren();
  emptyMessage.hidden = cart.length > 0;
  cartSummary.hidden = cart.length === 0;

  let totalInOre = 0;
  let hasUnavailableItems = false;

  cart.forEach((item) => {
    const product = products.find((product) => {
      return product.id === item.id;
    });

    if (product) {
      const unitPriceInOre = Math.round(getUnitPrice(product) * 100);
      totalInOre += unitPriceInOre * item.quantity;
    } else {
      hasUnavailableItems = true;
    }

    const cartItem = createCartItem(item, product);
    cartItems.append(cartItem);
  });

  cartTotal.textContent = hasUnavailableItems
    ? "Remove unavailable items to see your total."
    : priceFormatter.format(totalInOre / 100);
  checkoutLink.hidden =
    cart.length === 0 || hasUnavailableItems || hasInvalidSizes;
}

async function loadCart() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  resetCartButton.hidden = true;
  emptyMessage.hidden = true;
  cartSummary.hidden = true;
  checkoutLink.hidden = true;

  try {
    const cart = getCart();

    if (cart.length > 0) {
      products = await getProducts();
    }

    renderCart();
  } catch (error) {
    cartItems.replaceChildren();
    emptyMessage.hidden = true;
    cartSummary.hidden = true;
    checkoutLink.hidden = true;

    if (error instanceof InvalidCartError) {
      errorMessage.textContent = error.message;
      resetCartButton.hidden = false;
    } else {
      errorMessage.textContent =
        "We could not load you cart. Please refresh the page and try again.";
    }

    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
  }
}

resetCartButton.addEventListener("click", async () => {
  resetCartButton.disabled = true;

  try {
    clearCart();
    await loadCart();
    cartTitle.focus();
  } catch {
    errorMessage.textContent =
      "We could not reset your cart. Please check that browser storage is available and try again";
    errorMessage.hidden = false;
  } finally {
    resetCartButton.disabled = false;
  }
});

loadCart();
