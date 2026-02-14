import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', categoryController.getAllCategories);

export default router;
