import { getProducts } from "./api.js";
import { getCart, clearCart, InvalidCartError } from "./cart.js";
import { priceFormatter } from "./utils.js";

const cartTitle = document.querySelector("#cart-title");
const loadingMessage = document.querySelector("#cart-loading");
const errorMessage = document.querySelector("#cart-page-error");
const emptyMessage = document.querySelector("#cart-empty");
const cartItems = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const cartTotal = document.querySelector("#cart-total");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutFields = document.querySelector("#checkout-fields");
const orderLoading = document.querySelector("#order-loading");
const resetCartButton = document.querySelector("#reset-cart");

let isProcessingOrder = false;

let products = [];

function getUnitPrice(product) {
  if (product.onSale && product.discountedPrice < product.price) {
    return product.discountedPrice;
  }

  return product.price;
}

function hasValidSize(item, product) {
  return (
    product && Array.isArray(product.sizes) && product.sizes.includes(item.size)
  );
}

function createCartItem(item, product) {
  const article = document.createElement("article");
  article.classList.add("cart-item");

  const details = document.createElement("div");
  details.classList.add("cart-item-details");

  const title = document.createElement("h3");
  title.classList.add("cart-item-name");

  const quantity = document.createElement("p");
  quantity.classList.add("checkout-item-quantity");
  quantity.textContent = `Quantity: ${item.quantity}`;

  const size = document.createElement("p");
  size.classList.add("checkout-item-quantity");

  size.textContent = hasValidSize(item, product)
    ? `Size: ${item.size}`
    : "Size missing or unavailable. Return to cart to update this item.";

  const price = document.createElement("p");
  price.classList.add("cart-item-price");

  if (product) {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("cart-item-image");

    const image = document.createElement("img");
    image.src = product.image.url;
    image.alt = product.image.alt || product.title;

    imageContainer.append(image);
    article.append(imageContainer);

    title.textContent = product.title.replace(/^Rainy Days\s+/i, "");

    const lineTotalInOre =
      Math.round(getUnitPrice(product) * 100) * item.quantity;

    price.textContent = priceFormatter.format(lineTotalInOre / 100);
  } else {
    title.textContent = "Unavailable jacket";
    price.textContent = "Unavailable";

    const message = document.createElement("p");
    message.textContent =
      "Return to your cart to remove this jacket before ordering.";

    details.append(message);
  }

  details.prepend(title, size, quantity);
  article.append(details, price);

  return article;
}

function renderCart() {
  const cart = getCart();

  cartItems.replaceChildren();
  emptyMessage.hidden = cart.length > 0;
  cartSummary.hidden = cart.length === 0;

  let totalInOre = 0;
  let hasUnavailableItems = false;
  let hasInvalidSizes = false;

  cart.forEach((item) => {
    const product = products.find((product) => {
      return product.id === item.id;
    });

    if (product && !hasValidSize(item, product)) {
      hasInvalidSizes = true;
    }

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
  checkoutForm.hidden =
    cart.length === 0 || hasUnavailableItems || hasInvalidSizes;
}

async function loadCart() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  resetCartButton.hidden = true;
  emptyMessage.hidden = true;
  cartSummary.hidden = true;
  checkoutForm.hidden = true;

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
    checkoutForm.hidden = true;

    if (error instanceof InvalidCartError) {
      errorMessage.textContent = error.message;
      resetCartButton.hidden = false;
    } else {
      errorMessage.textContent =
        "We could not load your cart. Please refresh the page and try again.";
    }

    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
  }
}

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isProcessingOrder) {
    return;
  }

  isProcessingOrder = true;
  checkoutFields.disabled = true;
  orderLoading.hidden = false;
  errorMessage.hidden = true;

  cartItems.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });

  let receiptSaved = false;

  try {
    const cart = getCart();

    if (cart.length === 0) {
      throw new Error("Your cart is empty. Please add a jacket first.");
    }

    const updatedProducts = await getProducts();

    const hasUnavailableItems = cart.some((item) => {
      return !updatedProducts.find((product) => {
        return product.id === item.id;
      });
    });

    const pricesChanged = cart.some((item) => {
      const previousProduct = products.find((product) => {
        return product.id === item.id;
      });

      const updatedProduct = updatedProducts.find((product) => {
        return product.id === item.id;
      });

      if (!previousProduct || !updatedProduct) {
        return true;
      }

      const previousPriceInOre = Math.round(
        getUnitPrice(previousProduct) * 100,
      );

      const updatedPriceInOre = Math.round(getUnitPrice(updatedProduct) * 100);

      return previousPriceInOre !== updatedPriceInOre;
    });

    products = updatedProducts;

    if (hasUnavailableItems) {
      renderCart();

      throw new Error(
        "A jacket is no longer available. Please remove it from your cart before ordering.",
      );
    }

    const hasInvalidSizes = cart.some((item) => {
      const product = products.find((product) => product.id === item.id);

      return !hasValidSize(item, product);
    });

    if (hasInvalidSizes) {
      renderCart();

      throw new Error(
        "A selected size is missing or no longer available. Please return to your cart and update the item before ordering.",
      );
    }

    if (pricesChanged) {
      renderCart();

      throw new Error(
        "Prices have changed. Your cart now shows the updated prices. Please review the total and press Complete demo purchase again to confirm.",
      );
    }

    let totalInOre = 0;
    let itemCount = 0;

    cart.forEach((item) => {
      const product = products.find((product) => {
        return product.id === item.id;
      });

      if (!product) {
        throw new Error(
          "A jacket is no longer available. Refresh the page and remove it befor ordering.",
        );
      }

      const unitPriceInOre = Math.round(getUnitPrice(product) * 100);

      totalInOre += unitPriceInOre * item.quantity;
      itemCount += item.quantity;
    });

    const order = {
      id: `RD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      itemCount,
      totalInOre,
    };

    sessionStorage.setItem("rainyDaysOrder", JSON.stringify(order));
    receiptSaved = true;

    clearCart();

    window.location.href = "confirmation/index.html";
  } catch (error) {
    if (receiptSaved) {
      try {
        sessionStorage.removeItem("rainyDaysOrder");
      } catch {
        //Storage may be unavailable.
      }
    }

    errorMessage.textContent =
      error instanceof Error
        ? error.message
        : "We could not complete your order. Please try again.";

    errorMessage.hidden = false;
  } finally {
    isProcessingOrder = false;
    checkoutFields.disabled = false;
    orderLoading.hidden = true;

    cartItems.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
    });
  }
});

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
