import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Book from "../models/book.model.js";

async function getOrCreateUserCart(userId) {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
  return cart;
}

export async function list(req, res, next) {
  try {
    const cart = await getOrCreateUserCart(req.user._id);
    await cart.populate("items.book");
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
      return res.status(400).json({ message: "Invalid bookId format" });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    const [book, cart] = await Promise.all([
      Book.findById(bookId).lean(),
      getOrCreateUserCart(req.user._id),
    ]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const existingItem = cart.items.find((item) => item.book.equals(book._id));

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
    const updatedCart = await Cart.findById(cart._id).populate("items.book");
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

export async function updateQuantity(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = Math.floor(Number(quantity));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item ID format" });
    }
    if (!Number.isInteger(qty)) {
      return res.status(400).json({ message: "Quantity must be an integer" });
    }

    const cart = await getOrCreateUserCart(req.user._id);
    const item = cart.items.id(id);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (qty <= 0) {
      item.deleteOne();
    } else {
      item.quantity = qty;
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.book");
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item ID format" });
    }

    const cart = await getOrCreateUserCart(req.user._id);
    const item = cart.items.id(id);

    if (!item) {
      // If item is not found, it's a client error. Return 404.
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.deleteOne();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.book");
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}