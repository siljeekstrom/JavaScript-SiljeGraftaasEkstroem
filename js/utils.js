// Share consistent NOK price formatting across all pages.
export const priceFormatter = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
});
