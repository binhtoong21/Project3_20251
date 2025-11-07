import { books } from '../data/mock.js';

export function list(req, res) {
  const { page = '1', limit = '20', sort, order } = req.query || {};
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  let result = [...books];

  // Sort
  const sortKey = sort === 'price' || sort === 'createdAt' ? sort : undefined;
  const sortOrder = order === 'asc' ? 'asc' : order === 'desc' ? 'desc' : undefined;
  if (sortKey && sortOrder) {
    result.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      let cmp = 0;
      if (sortKey === 'createdAt') {
        cmp = new Date(va) - new Date(vb);
      } else {
        cmp = (va || 0) - (vb || 0);
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }

  const total = result.length;
  const start = (pageNum - 1) * limitNum;
  const items = result.slice(start, start + limitNum);

  res.json({ items, page: pageNum, limit: limitNum, total });
}

export function getById(req, res) {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
}
