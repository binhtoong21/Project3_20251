import { Router } from 'express';
import * as booksCtrl from '../controllers/books.controller.js';

const router = Router();

router.get('/', booksCtrl.list);
router.get('/:id', booksCtrl.getById);

export default router;
