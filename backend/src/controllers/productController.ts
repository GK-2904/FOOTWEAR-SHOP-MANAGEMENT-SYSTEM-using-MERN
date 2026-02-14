import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel.js';
import { StockModel } from '../models/stockModel.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.getById(parseInt(req.params.id as string));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const stock = await StockModel.getByProductId(product.id);
    res.json({ ...product, stock });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.create(req.body);
    // If stock is provided in creation
    if (req.body.stock && Array.isArray(req.body.stock)) {
      for (const s of req.body.stock) {
        await StockModel.setStock(product.id, s.size, s.quantity);
      }
    }
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.update(parseInt(req.params.id as string), req.body);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.delete(parseInt(req.params.id as string));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
