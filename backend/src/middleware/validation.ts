import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

export const brandValidation = [
  body('name').notEmpty().withMessage('Brand name is required').trim().isLength({ min: 2 }),
];

export const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('brand_id').isNumeric().withMessage('Valid Brand ID is required'),
  body('category_id').isNumeric().withMessage('Valid Category ID is required'),
  body('purchase_price').isNumeric().withMessage('Valid purchase price is required'),
  body('selling_price').isNumeric().withMessage('Valid selling price is required'),
];

export const billValidation = [
  body('bill_number').notEmpty().withMessage('Bill number is required'),
  body('total_amount').isNumeric().withMessage('Total amount must be a number'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
];
