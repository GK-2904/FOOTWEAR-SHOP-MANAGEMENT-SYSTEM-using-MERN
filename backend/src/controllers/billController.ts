import { Request, Response } from 'express';
import { BillModel } from '../models/billModel.js';

export const getAllBills = async (req: Request, res: Response) => {
  try {
    const bills = await BillModel.getAll();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBillById = async (req: Request, res: Response) => {
  try {
    const bill = await BillModel.getById(parseInt(req.params.id as string));
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBill = async (req: Request, res: Response) => {
  try {
    const { items, ...billData } = req.body;
    billData.created_by = (req as any).user.id;
    const bill = await BillModel.create(billData, items);
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
