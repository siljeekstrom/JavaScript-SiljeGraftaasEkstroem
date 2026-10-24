import { getProduct } from "./api.js";
import { addToCart } from "./cart.js";
import { priceFormatter } from "./utils.js";

const loadingMessage = document.querySelector("#product-loading");
const errorMessage = document.querySelector("#product-error");
const productContent = document.querySelector("#product-content");

const productTitle = document.querySelector("#product-title");
const productImage = document.querySelector("#product-image");
const productPrice = document.querySelector("#product-price");
const productDescription = document.querySelector("#product-description");
const productBreadcrumb = document.querySelector("#product-breadcrumb");
const addToCartButton = document.querySelector("#add-to-cart");
const cartMessage = document.querySelector("#cart-message");
const cartError = document.querySelector("#cart-error");

let currentProduct = null;

function renderProduct(product) {
  const displayTitle = product.title.replace(/^Rainy Days\s+/i, "");

  productTitle.textContent = displayTitle;
  productBreadcrumb.textContent = displayTitle;
  productDescription.textContent = product.description;

  productImage.src = product.image.url;
  productImage.alt = product.image.alt || product.title;

  document.title = `${displayTitle} | Rainy Days`;

  productPrice.replaceChildren();

  if (product.onSale && product.discountedPrice < product.price) {
    const originalPrice = document.createElement("del");
    originalPrice.textContent = priceFormatter.format(product.price);

    const salePrice = document.createElement("span");
    salePrice.classList.add("sale-price");
    salePrice.textContent = `Sale: ${priceFormatter.format(product.discountedPrice)}`;

    productPrice.append(originalPrice, salePrice);
  } else {
    productPrice.textContent = priceFormatter.format(product.price);
  }
}

async function loadProduct() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  productContent.hidden = true;

  try {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId || !productId.trim()) {
      throw new Error(
        "No jacket was selected. Please go back to the shop and select a jacket.",
      );
    }

    const product = await getProduct(productId);

    renderProduct(product);

    currentProduct = product;
    addToCartButton.disabled = false;
    productContent.hidden = false;
  } catch (error) {
    errorMessage.textContent =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again later.";

    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
  }
}

addToCartButton.addEventListener("click", () => {
  cartMessage.textContent = "";
  cartError.hidden = true;

  try {
    if (!currentProduct) {
      throw new Error("Please wait until the jacket has loaded");
    }

    addToCart(currentProduct.id);

    const displayTitle = currentProduct.title.replace(/^Rainy Days\s+/i, "");

    cartMessage.textContent = `${displayTitle} added to your cart.`;
  } catch (error) {
    cartError.textContent =
      "We could not add this jacket to your cart. Please check that browser storage is available and try again.";

    cartError.hidden = false;
  }
});

loadProduct();
