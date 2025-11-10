import { Router } from 'express';
import * as cartCtrl from '../controllers/cart.controller.js';

const router = Router();

router.get('/', cartCtrl.list);
router.post('/add', cartCtrl.add);
router.put('/:id', cartCtrl.updateQuantity);
router.delete('/:id', cartCtrl.remove);

export default router;
