import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/customer-profit', reportController.getCustomerProfit);
router.get('/product-profit', reportController.getProductProfit);
router.get('/monthly-profit', reportController.getMonthlyProfit);
router.get('/daily-profit', reportController.getDailyProfit);
router.get('/category-profit', reportController.getCategoryProfit);

export default router;
