import mongoose from 'mongoose';
import Book from '../models/book.model.js';

export async function list(req, res, next) {
  try {
    const { page = '1', limit = '20', sort, order } = req.query || {};
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    const sortKey = sort === 'price' || sort === 'createdAt' ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    sortOptions[sortKey] = sortOrder;

    const total = await Book.countDocuments();
    const items = await Book.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({ items, page: pageNum, limit: limitNum, total });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
}
