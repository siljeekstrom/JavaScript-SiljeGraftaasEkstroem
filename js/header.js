import { getProducts } from "./api.js";
import { priceFormatter } from "./utils.js";
import "./cart-count.js";

const searchForm = document.querySelector("#header-search");
const searchInput = document.querySelector("#product-search");
const dropdown = document.querySelector("#search-dropdown");
const suggestions = document.querySelector("#search-suggestions");
const status = document.querySelector("#search-status");

if (searchForm && searchInput && dropdown && suggestions && status) {
  let productRequest = null;
  let searchVersion = 0;

  async function getSearchProducts() {
    try {
      if (!productRequest) {
        productRequest = getProducts();
      }

      return await productRequest;
    } catch (error) {
      productRequest = null;
      throw error;
    }
  }

  function closeSuggestions() {
    searchVersion += 1;
    dropdown.hidden = true;
  }

  async function showSuggestions() {
    const currentVersion = ++searchVersion;
    const searchTerm = searchInput.value.trim().toLowerCase();

    suggestions.replaceChildren();

    if (!searchTerm) {
      dropdown.hidden = true;
      status.textContent = "";
      return;
    }

    dropdown.hidden = false;
    status.textContent = "Loading suggestions...";

    try {
      const products = await getSearchProducts();

      if (currentVersion !== searchVersion) {
        return;
      }

      const categoryGender = document.body.dataset.gender;

      const matches = products.filter((product) => {
        const matchesName = product.title.toLowerCase().includes(searchTerm);

        const matchesCategory =
          !categoryGender || product.gender === categoryGender;

        return matchesName && matchesCategory;
      });

      status.textContent =
        matches.length === 0
          ? "No jackets found."
          : `${matches.length} jackets found. Showing up to 5.`;

      matches.slice(0, 5).forEach((product) => {
        const item = document.createElement("li");
        const link = document.createElement("a");

        const productUrl = new URL("../product/index.html", import.meta.url);

        productUrl.searchParams.set("id", product.id);
        link.href = productUrl.href;

        const name = document.createElement("span");
        name.textContent = product.title.replace(/^Rainy Days\s+/i, "");

        const price = document.createElement("span");

        const unitPrice =
          product.onSale && product.discountedPrice < product.price
            ? product.discountedPrice
            : product.price;

        price.textContent = priceFormatter.format(unitPrice);

        const image = document.createElement("img");
        image.src = product.image.url;
        image.alt = "";
        image.loading = "lazy";
        image.classList.add("search-result-image");

        const info = document.createElement("div");
        info.classList.add("search-result-info");
        info.append(name, price);

        link.append(image, info);
        item.append(link);
        suggestions.append(item);
      });
    } catch {
      if (currentVersion !== searchVersion) {
        return;
      }

      status.textContent =
        "We could not load suggestions. Please try typing again.";
    }
  }

  searchInput.addEventListener("input", showSuggestions);
  searchInput.addEventListener("focus", showSuggestions);

  searchForm.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const isMobile = window.matchMedia("(max-width: 860px)").matches;

      if (isMobile) {
        searchForm.classList.remove("is-open");
        searchForm.querySelector(".header-search-submit").focus();
      } else {
        searchInput.focus();
      }

      closeSuggestions();
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) {
      closeSuggestions();
      searchForm.classList.remove("is-open");
    }
  });

  searchForm.addEventListener("focusout", (event) => {
    if (!searchForm.contains(event.relatedTarget)) {
      closeSuggestions();
      searchForm.classList.remove("is-open");
    }
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isMobile = window.matchMedia("(max-width: 860px)").matches;

    if (isMobile && !searchForm.classList.contains("is-open")) {
      searchForm.classList.add("is-open");
      searchInput.focus();
      return;
    }

    showSuggestions();
  });
}
