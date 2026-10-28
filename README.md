# JavaScript-SiljeGraftaasEkstroem

JavaScript 1 Course Assignment

# Rainy Days

Rainy Days is a student e-commerce project built with HTML, CSS ans vanilla JavaScript. It builds on my earlier HTML and CSS project, adding dynamic product data and a simulated shopping experience.

## Links

- Live website:
- Repository:

## Features

- Dynamic product listing from the Noroff Rainy Days API
- Product detail pages with descriptions and discounted prices
- Gender filtering and separate women's and men's category pages
- Header search with product suggestions
- Size selection before adding a jacket to the cart
- Shopping cart with quantity controls and item removal
- Separate cart items for different sizes of the same jacket
- Cart quantity badge and add-to-cart notifications
- Checkout summary and simulated order confirmation
- Related product recommendations
- Loading indicators and user-facing error messages
- Term and Conditions and Privacy Policy pages

## Technologies

- HTML
- CSS
- Vanilla JavaScript
- ES modules
- Fetch API with async/await
- localStorage for the shopping cart
- sessionStorage for the demo order confirmation

## Run locally

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Start Live Server from index.html.

The project requires a local web server because it uses JavaScript modules. No build step or package installation is required.

## Main pages

| Page                 | Path                              |
| -------------------- | --------------------------------- |
| Home                 | index.html                        |
| Women's jackets      | /category/womens-clothing.html    |
| Men's jackets        | /category/mens-clothing.html      |
| Product details      | /product/index.html?id=PRODUCT_ID |
| Shopping cart        | /cart/index.html                  |
| Checkout             | /checkout/index.html              |
| Order confirmation   | /checkout/confirmation/index.html |
| About                | /about.html                       |
| Contact              | /contact.html                     |
| Terms and Conditions | /terms.html                       |
| Privacy Policy       | /privacy.html                     |

## API

Product data and images are fetched from the
[Noroff Rainy Days API](https://docs.noroff.dev/docs/v2/e-commerce/rainy-days).

Endpoint: https://v2.api.noroff.dev/rainy-days

Product prices are formatted in NOK using Intl.NumberFormat.
No currency conversion is performed.

## Browser storage

The shopping cart is stored in localStorage under rainyDaysCart.
Each item contains a product ID, selected size and quantity.

The order confirmation is stored in sessionStorage under rainyDaysOrder. It contains an order reference, creation time, total quantity and total price. Checkout form details are not included in the stored order.

Completing a demo purchase clears the cart.

## Testing

Manual testing covered:

- Adding the same jacket in different sizes
- Updating quantities and removing individual cart items
- Cart persistence across pages and after refreshing
- Empty cart behaviour
- Required checkout fields and email validation
- Successful checkout and cart clearing
- Loading indicators with a slow connection
- Error messages with blocked API request
- Retrying checkout after a failed API request
- Missing and unknown product IDs
- Keyboard navigation and visible focus indicators
- Mobile and tablet layouts

HTML files were checked using the W3C HTML validator.
CSS was checked using the W3C CSS validator.
Accessibility checks were performed using WAVE alongside manual keyboard testing.

## Limitations

This is a demonstration store. No payment is collected, no products are shipped and no confirmation email is sent. Use fictional information when testing checkout.

The API provides one image ans one base colour per product. Product availability depends on the external API

Delivery and return information is illustrative.

## Credits

- Product information and images: Noroff Rainy Days API
- AI assistance is documented in AI_LOG.md and the project reflection.
