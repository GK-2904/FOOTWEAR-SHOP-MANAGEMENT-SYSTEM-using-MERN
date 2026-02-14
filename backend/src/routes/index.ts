import { Router } from 'express';
import authRoutes from './authRoutes.js';
import brandRoutes from './brandRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import stockRoutes from './stockRoutes.js';
import billRoutes from './billRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/bills', billRoutes);

export default router;
