import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { productValidation, validate } from '../middleware/validation.js';

const router = Router();

router.use(authenticateToken);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productValidation, validate, productController.createProduct);
router.put('/:id', productValidation, validate, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
