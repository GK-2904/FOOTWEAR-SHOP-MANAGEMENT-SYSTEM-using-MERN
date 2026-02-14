import { Router } from 'express';
import * as stockController from '../controllers/stockController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.put('/update', stockController.updateStock);
router.get('/low-stock', stockController.getLowStock);

export default router;
