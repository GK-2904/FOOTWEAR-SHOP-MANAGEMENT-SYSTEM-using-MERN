import { Router } from 'express';
import * as brandController from '../controllers/brandController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { brandValidation, validate } from '../middleware/validation.js';

const router = Router();

router.use(authenticateToken);

router.get('/', brandController.getAllBrands);
router.post('/', brandValidation, validate, brandController.createBrand);
router.put('/:id', brandValidation, validate, brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

export default router;
