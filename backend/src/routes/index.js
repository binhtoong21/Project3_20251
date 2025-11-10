import { Router } from 'express';
import booksRouter from './books.routes.js';
import cartRouter from './cart.routes.js';

const router = Router();

router.use('/books', booksRouter);
router.use('/cart', cartRouter);

export default router;
