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

/**
 * Syncs cart items' cached details (price, title, cover) with the actual Book document.
 * Removes items if the Book no longer exists.
 * Returns true if changes were made (so we know to save).
 */
function syncCartWithBooks(cart) {
  let changed = false;
  if (!cart.items) return false;

  const newItems = [];
  for (const item of cart.items) {
    if (!item.book) {
      // Book deleted or reference broken
      changed = true;
      continue;
    }

    // item.book is the populated Book document
    const book = item.book;

    // Check price
    if (item.price !== book.price) {
      item.price = book.price;
      changed = true;
    }
    // Check title
    if (item.title !== book.title) {
      item.title = book.title;
      changed = true;
    }
    // Check cover
    const freshCover = Array.isArray(book.cover)
      ? book.cover.length > 0
        ? book.cover[0]
        : ""
      : book.cover || "";
    if (item.cover !== freshCover) {
      item.cover = freshCover;
      changed = true;
    }

    newItems.push(item);
  }

  if (changed) {
    cart.items = newItems;
  }
  return changed;
}

export async function list(req, res, next) {
  try {
    const cart = await getOrCreateUserCart(req.user._id);
    await cart.populate("items.book");

    if (syncCartWithBooks(cart)) {
      await cart.save();
    }

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

    // Check 1: Prevent self-purchase
    if (book.owner && book.owner.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Bạn không thể mua sách do chính mình đăng bán." });
    }

    // Check 2: Used Books (C2C) cannot be added to cart (Buy Now only)
    if (book.owner) {
      return res.status(400).json({
        message: "Sách cũ chỉ có thể Mua Ngay, không thể thêm vào giỏ hàng.",
      });
    }

    const existingItem = cart.items.find((item) => item.book.equals(book._id));
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQtyInCart + qty;

    if (totalRequested > book.stock) {
      return res.status(400).json({
        message: `Chỉ còn ${book.stock} cuốn trong kho. Bạn đã có ${currentQtyInCart} cuốn trong giỏ.`,
      });
    }

    if (existingItem) {
      existingItem.quantity += qty;
      // Also update details if they changed (though syncCartWithBooks will cover it globally later)
      existingItem.price = book.price;
      existingItem.title = book.title;
      existingItem.cover = Array.isArray(book.cover)
        ? book.cover.length > 0
          ? book.cover[0]
          : ""
        : book.cover || "";
    } else {
      cart.items.push({
        book: book._id,
        quantity: qty,
        price: book.price,
        title: book.title,
        cover: Array.isArray(book.cover)
          ? book.cover.length > 0
            ? book.cover[0]
            : ""
          : book.cover || "",
      });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.book");
    
    // Ensure everything else is synced too
    if (syncCartWithBooks(updatedCart)) {
        await updatedCart.save();
    }
    
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
      //  CHECK TỒN KHO
      // Cần query lại sách để lấy stock mới nhất
      const book = await Book.findById(item.book);
      if (!book) {
        item.deleteOne(); // Sách bị xóa thì xóa khỏi giỏ
      } else if (qty > book.stock) {
        return res
          .status(400)
          .json({ message: `Số lượng vượt quá tồn kho (${book.stock})` });
      } else {
        item.quantity = qty;
      }
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.book");
    
    if (syncCartWithBooks(updatedCart)) {
        await updatedCart.save();
    }

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
    
    if (syncCartWithBooks(updatedCart)) {
        await updatedCart.save();
    }

    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
}
