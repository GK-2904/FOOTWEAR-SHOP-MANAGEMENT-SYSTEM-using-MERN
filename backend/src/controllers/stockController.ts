import { Request, Response } from 'express';
import { StockModel } from '../models/stockModel.js';

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId, size, quantity, oldSize } = req.body;
    let stock;
    const prodId = parseInt(productId as string);
    const qty = parseInt(quantity as string);
    const sz = size as string;

    if (oldSize) {
      stock = await StockModel.updateSpecificStock(prodId, oldSize as string, sz, qty);
    } else {
      stock = await StockModel.setStock(prodId, sz, qty);
    }
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

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const size = req.params.size as string;
    await StockModel.deleteStock(parseInt(productId), size);
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
