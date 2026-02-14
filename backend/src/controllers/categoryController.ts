import { Request, Response } from 'express';
import { CategoryModel } from '../models/categoryModel.js';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
