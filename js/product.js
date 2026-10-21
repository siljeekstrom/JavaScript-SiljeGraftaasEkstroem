import { getProduct } from "./api.js";

const priceFormatter = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
});

const loadingMessage = document.querySelector("#product-loading");
const errorMessage = document.querySelector("#product-error");
const productContent = document.querySelector("#product-content");

const productTitle = document.querySelector("#product-title");
const productImage = document.querySelector("#product-image");
const productPrice = document.querySelector("#product-price");
const productDescription = document.querySelector("#product-description");
const productBreadcrumb = document.querySelector("#product-breadcrumb");

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
        salePrice.textContent = 
            `Sale: ${priceFormatter.format(product.discountedPrice)}`;

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
            throw new Error("No jacket was selected. Please go back to the shop and select a jacket.");
        }

        const product = await getProduct(productId);

        renderProduct(product);
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

loadProduct();