import { getProducts } from "./api.js";
import { getCart, removeFromCart } from "./cart.js";

const priceFormatter = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
});

const cartTitle = document.querySelector("#cart-title");
const loadingMessage = document.querySelector("#cart-loading");
const errorMessage = document.querySelector("#cart-page-error");
const emptyMessage = document.querySelector("#cart-empty");
const cartItems = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const cartTotal = document.querySelector("#cart-total");

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
    quantity.textContent = `Quantity: ${item.quantity}"`;

    const price = document.createElement("p");
    price.classList.add("cart-item-price");

    if (product) {
    const unitPrice = getUnitPrice(product);
    const lineTotal = Math.round(unitPrice * 100) * item.quantity;

    price.textContent =
    `${priceFormatter.format(unitPrice)} each · ` +
    `${priceFormatter.format(lineTotal / 100)} total`;
    } else {
        price.textContent = "This jacket is no longer available. Please remove it from your cart.";
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
            errorMessage.textContent = "We could not update your cart. Please try again.";
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
    }

    async function loadCart() {
        loadingMessage.hidden = false;
        errorMessage.hidden = true;
        emptyMessage.hidden = true;
        cartSummary.hidden = true;

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

            errorMessage.textContent = "We could not load you cart. Please refresh the page and try again.";
            errorMessage.hidden = false;
        } finally {
            loadingMessage.hidden = true;
        }
        }
    loadCart();