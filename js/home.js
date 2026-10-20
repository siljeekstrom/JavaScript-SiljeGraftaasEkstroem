import { getProducts } from "./api.js";

const priceFormatter = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
});

const productList = document.querySelector("#product-list");
const loadingMessage = document.querySelector("#products-loading");
const errorMessage = document.querySelector("#products-error");

function createProductCard(product) {
    const link = document.createElement("a");
    link.classList.add("product-tile");
    link.href = `product/index.html?id=${encodeURIComponent(product.id)}`;

    const article = document.createElement("article");
    article.classList.add("product-card");

    const image = document.createElement("img");
    image.src = product.image.url;
    image.alt = product.image.alt || product.title;
    image.loading = "lazy";

    const info = document.createElement("div");
    info.classList.add("product-info");

    const title = document.createElement("h3");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.classList.add("price");

    if (product.onSale && product.discountedPrice < product.price) {
        const originalPrice = document.createElement("del");
        originalPrice.textContent = priceFormatter.format(product.price);

        const salePrice = document.createElement("span");
        salePrice.classList.add("sale-price");
        salePrice.textContent = `Sale: ${priceFormatter.format(product.discountedPrice)}`;

        price.append(originalPrice, salePrice);
    } else {
        price.textContent = priceFormatter.format(product.price);
    }

    info.append(title, price);
    article.append(image, info);
    link.append(article);

    return link;
}

async function loadProducts() {
    loadingMessage.hidden = false;
    errorMessage.hidden = true;
    productList.replaceChildren();
    productList.setAttribute("aria-busy", "true");

    try {
        const products = await getProducts();

        if (products.length === 0) {
            productList.textContent = "No products available.";
            return;
        }

        products.forEach((product) => {
            const card = createProductCard(product);
            productList.append(card);
        });
    } catch (error) {
        console.error(error);

        productList.replaceChildren();
        errorMessage.textContent = "We could not load the products. Please try again later.";
        errorMessage.hidden = false;
    } finally {
        loadingMessage.hidden = true;
        productList.setAttribute("aria-busy", "false");
    }
}

loadProducts();