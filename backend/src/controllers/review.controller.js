import asyncHandler from "express-async-handler";
import Review from "../models/review.model.js";
import Book from "../models/book.model.js";
import Order from "../models/order.model.js";

// @desc    Get reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
export const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { bookId, rating, comment, orderId } = req.body;

  // Optional: Verify that the user has actually bought and received the book?
  // User Requirement: "Add a post-transaction rating/review system"
  // So we should verify they bought it and order status is Completed (Escrow Released)
  
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    status: 'Completed', 
    'orderItems.book': bookId 
  });

  if (!order) {
    res.status(400); 
    // Relaxed check: Allow review if they bought it, even if not strictly linked to this specific order ID in payload? 
    // Or strictly enforce 'Verified Purchase' via logic.
    // Let's strictly enforce for now given the "post-transaction" requirement.
    throw new Error("You can only review books you have purchased and received.");
  }

  const alreadyReviewed = await Review.findOne({
    book: bookId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this book");
  }

  const review = await Review.create({
    book: bookId,
    user: req.user._id,
    order: orderId,
    rating: Number(rating),
    comment,
  });

  res.status(201).json(review);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
     res.status(401);
     throw new Error("Not authorized");
  }

  await Review.deleteOne({ _id: req.params.id });
  res.json({ message: "Review removed" });
});
