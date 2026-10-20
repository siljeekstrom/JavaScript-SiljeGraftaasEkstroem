import { getProducts } from "./api.js";

const priceFormatter = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
});

const productList = document.querySelector("#product-list");
const loadingMessage = document.querySelector("#products-loading");
const errorMessage = document.querySelector("#products-error");
const genderFilter = document.querySelector("#gender-filter");
const productsCount = document.querySelector("#products-count");

let allProducts = [];

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

function renderProducts(products) {
    productList.replaceChildren();

    productsCount.textContent = `${products.length} ${products.length === 1 ? "jacket" : "jackets"} found`;

    if (products.length === 0) {
        productList.textContent = "No jackets match your selected criteria.";
        return;
    }

    products.forEach((product) => {
        const card = createProductCard(product);
        productList.append(card);
    });
}

genderFilter.addEventListener("change", () => {
    const selectedGender = genderFilter.value;

    if (selectedGender === "all") {
        renderProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter((product) => {
        return product.gender === selectedGender;
    });

    renderProducts(filteredProducts);
});

async function loadProducts() {
    loadingMessage.hidden = false;
    errorMessage.hidden = true;
    genderFilter.disabled = true;
    productsCount.textContent = "";
    productList.replaceChildren();
    productList.setAttribute("aria-busy", "true");

    try {
        allProducts = await getProducts();

        renderProducts(allProducts);

        genderFilter.disabled = false;
    } catch (error) {
        productList.replaceChildren();
        productsCount.textContent = "";

        errorMessage.textContent = "Failed to load jackets. Please try again later.";
        errorMessage.hidden = false;
    } finally {
        loadingMessage.hidden = true;
        productList.setAttribute("aria-busy", "false");
    }
}

loadProducts();