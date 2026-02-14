import { Request, Response } from 'express';
import { StockModel } from '../models/stockModel.js';

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId, size, quantity } = req.body;
    const stock = await StockModel.setStock(productId, size, quantity);
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 5;
    const items = await StockModel.getLowStock(threshold);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
