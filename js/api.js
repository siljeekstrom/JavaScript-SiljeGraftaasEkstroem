const API_URL = "https://v2.api.noroff.dev/rainy-days";

export async function getProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const result = await response.json();

    if (!Array.isArray(result.data)) {
        throw new Error("Unexpected product data");
    }

    return result.data;
}