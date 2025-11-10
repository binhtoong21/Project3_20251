export const cartItems = [];

export function getCartItems() {
  return cartItems;
}

export function findCartItem(bookId) {
  return cartItems.find((item) => item.bookId === bookId);
}

export function addOrUpdateCartItem({ bookId, quantity, price, title, cover }) {
  const existing = findCartItem(bookId);
  if (existing) {
    existing.quantity += quantity;
    if (existing.quantity <= 0) {
      removeCartItem(bookId);
    }
    return existing;
  }

  const newItem = {
    bookId,
    quantity,
    price,
    title,
    cover
  };
  cartItems.push(newItem);
  return newItem;
}

export function updateCartItemQuantity(bookId, quantity) {
  const existing = findCartItem(bookId);
  if (!existing) return null;

  existing.quantity = quantity;
  if (existing.quantity <= 0) {
    removeCartItem(bookId);
    return null;
  }
  return existing;
}

export function removeCartItem(bookId) {
  const index = cartItems.findIndex((item) => item.bookId === bookId);
  if (index !== -1) {
    cartItems.splice(index, 1);
    return true;
  }
  return false;
}

export function clearCart() {
  cartItems.length = 0;
}

export function getCartSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalQuantity };
}
