/**
 * Calculate the discounted price of an item
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage (0-100)
 * @returns {number} - Discounted price
 */
export function calculateDiscountedPrice(price, discount) {
  if (!discount || discount <= 0) {
    return price;
  }
  return price - (price * discount / 100);
}

/**
 * Calculate total cart value with discounts
 * @param {Array} cart - Array of cart items
 * @returns {number} - Total price
 */
export function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const price = calculateDiscountedPrice(item.price, item.discount);
    return sum + (price * (item.quantity || 1));
  }, 0);
}
