import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";
import { priceFormatter } from "./utils.js";

const productList = document.querySelector("#product-list");
const loadingMessage = document.querySelector("#products-loading");
const errorMessage = document.querySelector("#products-error");
const genderFilter = document.querySelector("#gender-filter");
const productsCount = document.querySelector("#products-count");
const cartMessage = document.querySelector("#home-cart-message");
const cartError = document.querySelector("#home-cart-error");
const categoryGender = document.body.dataset.gender || "all";

let allProducts = [];

function createProductCard(product) {
  const displayTitle = product.title.replace(/^Rainy Days\s+/i, "");

  const tile = document.createElement("div");
  tile.classList.add("product-tile");

  const article = document.createElement("article");
  article.classList.add("product-card");

  const link = document.createElement("a");
  link.classList.add("product-link");

  const productUrl = new URL("../product/index.html", import.meta.url);
  productUrl.searchParams.set("id", product.id);
  link.href = productUrl.href;

  const image = document.createElement("img");
  image.src = product.image.url;
  image.alt = product.image.alt || product.title;
  image.loading = "lazy";

  const info = document.createElement("div");
  info.classList.add("product-info");

  const title = document.createElement("h3");
  title.textContent = displayTitle;

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

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.classList.add("product-add-button");
  addButton.textContent = "Add to Cart";
  addButton.setAttribute("aria-label", `Add ${displayTitle} to cart`);

  addButton.addEventListener("click", () => {
    cartMessage.textContent = "";
    cartError.hidden = true;

    try {
      addToCart(product.id);

      cartMessage.textContent = `${displayTitle} added to your cart.`;
    } catch (error) {
      cartError.textContent =
        "We could not add this jacket to your cart. Please try again.";
      cartError.hidden = false;
    }
  });

  info.append(title, price);
  link.append(image, info);

  article.append(link, addButton);
  tile.append(article);

  return tile;
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

    genderFilter.value = categoryGender;

    const visibleProducts =
      categoryGender === "all"
        ? allProducts
        : allProducts.filter((product) => {
            return product.gender === categoryGender;
          });

    renderProducts(visibleProducts);

    genderFilter.disabled = categoryGender !== "all";
  } catch (error) {
    productList.replaceChildren();
    productsCount.textContent = "";

    errorMessage.textContent =
      "Failed to load jackets. Please try again later.";
    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
    productList.setAttribute("aria-busy", "false");
  }
}

loadProducts();
