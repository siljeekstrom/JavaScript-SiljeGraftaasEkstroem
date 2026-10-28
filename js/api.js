const API_URL = "https://v2.api.noroff.dev/rainy-days";

export async function getProducts() {
  let response;

  try {
    response = await fetch(API_URL);
  } catch {
    throw new Error(
      "Could not load jackets. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error("Unexpected product data");
  }

  return result.data;
}

export async function getProduct(id) {
  let response;

  try {
    response = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
  } catch {
    throw new Error(
      "Could not load this jacket. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "This jacket could not be found. Please check the URL and try again.",
      );
    }

    throw new Error("Could not load this jacket. Please try again later.");
  }

  const result = await response.json();

  if (!result.data || !result.data.id) {
    throw new Error("The product data is missing or invalid.");
  }

  return result.data;
}
