import { Request, Response } from 'express';
import { BrandModel } from '../models/brandModel.js';

export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await BrandModel.getAll();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const brand = await BrandModel.create(req.body.name);
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const brand = await BrandModel.update(parseInt(req.params.id as string), req.body.name);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const brand = await BrandModel.delete(parseInt(req.params.id as string));
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
