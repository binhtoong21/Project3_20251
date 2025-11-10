import { books } from '../data/mock.js';
import {
  addOrUpdateCartItem,
  getCartItems,
  getCartSummary,
  removeCartItem,
  updateCartItemQuantity
} from '../data/cart.js';

function respondWithCart(res, status = 200) {
  return res.status(status).json({
    items: getCartItems(),
    summary: getCartSummary()
  });
}

function parseQuantity(value, fallback = 1) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.floor(parsed);
}

export function list(_req, res) {
  return respondWithCart(res);
}

export function add(req, res) {
  const { bookId, quantity = 1 } = req.body ?? {};
  const id = Number(bookId);
  const qty = parseQuantity(quantity);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid bookId' });
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  addOrUpdateCartItem({
    bookId: id,
    quantity: qty,
    price: book.price,
    title: book.title,
    cover: book.cover
  });

  return respondWithCart(res);
}

export function updateQuantity(req, res) {
  const { id } = req.params;
  const quantity = parseQuantity(req.body?.quantity, 0);
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ message: 'Invalid cart item id' });
  }

  if (!Number.isInteger(quantity)) {
    return res.status(400).json({ message: 'Quantity must be an integer' });
  }

  if (quantity <= 0) {
    removeCartItem(bookId);
    return respondWithCart(res);
  }

  const updated = updateCartItemQuantity(bookId, quantity);
  if (!updated) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  return respondWithCart(res);
}

export function remove(req, res) {
  const bookId = Number(req.params.id);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ message: 'Invalid cart item id' });
  }

  removeCartItem(bookId);
  return respondWithCart(res);
}
