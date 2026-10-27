import { getProduct, getProducts } from "./api.js";
import { addToCart } from "./cart.js";
import { priceFormatter } from "./utils.js";
import { showCartNotification } from "./cart-notification.js";

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
const relatedProductsSection = document.querySelector("#related-products");
const relatedProductsList = document.querySelector("#related-products-list");
const sizeFieldset = document.querySelector("#product-size-fieldset");
const productSizes = document.querySelector("#product-sizes");
const relatedProductsLoading = document.querySelector(
  "#related-products-loading",
);
const relatedProductsError = document.querySelector("#related-products-error");
const relatedProductsEmpty = document.querySelector("#related-products-empty");

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

    function renderSizes(product) {
      productSizes.replaceChildren();

      const sizes = Array.isArray(product.sizes) ? product.sizes : [];

      sizeFieldset.hidden = sizes.length === 0;

      sizes.forEach((size, index) => {
        const label = document.createElement("label");
        label.classList.add("product-size-option");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "product-size";
        input.value = size;
        input.id = `product-size-${index}`;

        const text = document.createElement("span");
        text.textContent = size;

        label.htmlFor = input.id;
        label.append(input, text);
        productSizes.append(label);
      });
    }

    renderProduct(product);
    renderSizes(product);

    currentProduct = product;
    addToCartButton.disabled = false;
    productContent.hidden = false;
    loadRelatedProducts(product);
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

    const selectedSize = productSizes.querySelector(
      `input[name="product-size"]:checked`,
    );

    if (!selectedSize) {
      cartError.textContent = "Please choose a size before adding this jacket.";
      cartError.hidden = false;

      productSizes.querySelector("input")?.focus();
      return;
    }

    addToCart(currentProduct.id, selectedSize.value);

    const displayTitle = currentProduct.title.replace(/^Rainy Days\s+/i, "");

    cartMessage.textContent = `${displayTitle}, size ${selectedSize.value}, added to your cart.`;
    showCartNotification(currentProduct);
  } catch (error) {
    cartError.textContent =
      "We could not add this jacket to your cart. Please check that browser storage is available and try again.";

    cartError.hidden = false;
  }
});

async function loadRelatedProducts(currentProduct) {
  relatedProductsSection.hidden = false;
  relatedProductsLoading.hidden = false;
  relatedProductsError.hidden = true;
  relatedProductsEmpty.hidden = true;
  relatedProductsList.replaceChildren();
  relatedProductsList.setAttribute("aria-busy", "true");

  try {
    const products = await getProducts();

    const relatedProducts = products
      .filter((product) => {
        return (
          product.id !== currentProduct.id &&
          product.gender === currentProduct.gender
        );
      })
      .slice(0, 3);

    if (relatedProducts.length === 0) {
      relatedProductsEmpty.hidden = false;
      return;
    }

    relatedProducts.forEach((product) => {
      const article = document.createElement("article");
      article.classList.add("recommendation-card");

      const link = document.createElement("a");
      link.classList.add("recommendation-link");

      const productUrl = new URL("../product/index.html", import.meta.url);
      productUrl.searchParams.set("id", product.id);
      link.href = productUrl.href;

      const image = document.createElement("img");
      image.src = product.image.url;
      image.alt = product.image.alt || product.title;
      image.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = product.title.replace(/^Rainy Days\s+/i, "");

      const price = document.createElement("p");
      price.classList.add("recommendation-price");

      if (product.onSale && product.discountedPrice < product.price) {
        const originalPrice = document.createElement("del");
        originalPrice.textContent = priceFormatter.format(product.price);

        const salePrice = document.createElement("span");
        salePrice.classList.add("sale-price");
        salePrice.textContent = priceFormatter.format(product.discountedPrice);

        price.append(originalPrice, salePrice);
      } else {
        price.textContent = priceFormatter.format(product.price);
      }

      link.append(image, title, price);
      article.append(link);
      relatedProductsList.append(article);
    });

    relatedProductsSection.hidden = false;
  } catch {
    relatedProductsList.replaceChildren();

    relatedProductsError.textContent =
      "We could not load related jackets. Please refresh the page to try again.";

    relatedProductsError.hidden = false;
  } finally {
    relatedProductsLoading.hidden = true;
    relatedProductsList.setAttribute("aria-busy", "false");
  }
}

loadProduct();
