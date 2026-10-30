import { priceFormatter } from "./utils.js";

const message = document.querySelector("#confirmation-message");
const details = document.querySelector("#order-details");

function showConfirmation() {
  try {
    const storedOrder = sessionStorage.getItem("rainyDaysOrder");

    // Handle visits to this page without a saved demo order.
    if (!storedOrder) {
      message.textContent =
        "No completed order was found. Please return to the shop.";
      return;
    }

    const order = JSON.parse(storedOrder);

    // Validate the saved receipt before displaying its details.
    if (
      !order ||
      typeof order.id !== "string" ||
      !Number.isSafeInteger(order.itemCount) ||
      order.itemCount <= 0 ||
      !Number.isSafeInteger(order.totalInOre) ||
      order.totalInOre < 0
    ) {
      throw new Error("Invalid order information");
    }

    document.querySelector("#confirmation-title").textContent =
      "Thank you for your order!";

    document.querySelector("#order-reference").textContent = order.id;
    document.querySelector("#order-count").textContent = order.itemCount;
    document.querySelector("#order-total").textContent = priceFormatter.format(
      order.totalInOre / 100,
    );

    message.textContent = "Your demo order is complete.";
    details.hidden = false;
  } catch (error) {
    message.textContent = "We could not display your order confirmation.";
  }
}

showConfirmation();
