import { Router } from 'express';
import * as billController from '../controllers/billController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { billValidation, validate } from '../middleware/validation.js';

const router = Router();

router.use(authenticateToken);

router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.post('/', billValidation, validate, billController.createBill);
router.post('/:id/items/:itemId/return', billController.returnItem);

export default router;
