import mongoose from 'mongoose';
import Cart from '../models/cart.model.js';
import Book from '../models/book.model.js';

// Helper to get or create a guest cart
async function getGuestCart() {
  const cart = await Cart.findOne({ sessionId: 'guest' }).populate('items.book');
  if (cart) return cart;
  return Cart.create({ sessionId: 'guest', items: [] });
}

export async function list(req, res, next) {
  try {
    const cart = await getGuestCart();
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function add(req, res, next) {
  try {
    const { bookId, quantity = 1 } = req.body ?? {};
    const qty = Math.floor(Number(quantity));

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid bookId format' });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const [book, cart] = await Promise.all([
      Book.findById(bookId).lean(),
      getGuestCart(),
    ]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingItem = cart.items.find(item => item.book.equals(book._id));

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        book: book._id,
        quantity: qty,
        price: book.price,
        title: book.title,
        cover: book.cover,
      });
    }

    await cart.save();
    // Re-populate after save to get fresh data
    const updatedCart = await getGuestCart();
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

export async function updateQuantity(req, res, next) {
  try {
    const { id } = req.params; // This is now the cart item's _id
    const { quantity } = req.body;
    const qty = Math.floor(Number(quantity));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID format' });
    }
    if (!Number.isInteger(qty)) {
      return res.status(400).json({ message: 'Quantity must be an integer' });
    }

    const cart = await getGuestCart();
    const item = cart.items.id(id);

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (qty <= 0) {
      item.deleteOne(); // Mongoose sub-document removal
    } else {
      item.quantity = qty;
    }

    await cart.save();
    const updatedCart = await getGuestCart();
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params; // This is the cart item's _id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID format' });
    }

    const cart = await getGuestCart();
    const item = cart.items.id(id);

    if (!item) {
      // Already removed or never existed, idempotent success
      return res.status(200).json(cart);
    }

    item.deleteOne(); // Mongoose sub-document removal
    await cart.save();
    
    const updatedCart = await getGuestCart();
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}
