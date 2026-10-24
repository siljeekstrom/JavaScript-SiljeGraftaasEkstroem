import { getProducts } from "./api.js";
import { getCart, removeFromCart, clearCart } from "./cart.js";
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

let isProcessingOrder = false;

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

  const quantity = document.createElement("p");
  quantity.textContent = `Quantity: ${item.quantity}`;

  const price = document.createElement("p");
  price.classList.add("cart-item-price");

  if (product) {
    const unitPrice = getUnitPrice(product);
    const lineTotal = Math.round(unitPrice * 100) * item.quantity;

    price.textContent =
      `${priceFormatter.format(unitPrice)} each · ` +
      `${priceFormatter.format(lineTotal / 100)} total`;
  } else {
    price.textContent =
      "This jacket is no longer available. Please remove it from your cart.";
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.classList.add("remove-from-cart");
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", `Remove ${title.textContent}`);

  removeButton.addEventListener("click", () => {
    errorMessage.hidden = true;

    try {
      removeFromCart(item.id);
      renderCart();
      cartTitle.focus();
    } catch (error) {
      errorMessage.textContent =
        "We could not update your cart. Please try again.";
      errorMessage.hidden = false;
    }
  });

  details.append(title, quantity, price, removeButton);
  article.append(details);

  return article;
}

function renderCart() {
  const cart = getCart();

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
  checkoutForm.hidden = cart.length === 0 || hasUnavailableItems;
}

async function loadCart() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
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

    errorMessage.textContent =
      "We could not load you cart. Please refresh the page and try again.";
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

loadCart();
