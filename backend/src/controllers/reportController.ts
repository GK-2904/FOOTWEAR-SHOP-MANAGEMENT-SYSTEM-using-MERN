import { Request, Response } from 'express';
import { ReportModel } from '../models/reportModel.js';

export const getCustomerProfit = async (req: Request, res: Response) => {
    try {
        const data = await ReportModel.getCustomerProfit();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductProfit = async (req: Request, res: Response) => {
    try {
        const data = await ReportModel.getProductProfit();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMonthlyProfit = async (req: Request, res: Response) => {
    try {
        const data = await ReportModel.getMonthlyProfit();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDailyProfit = async (req: Request, res: Response) => {
    try {
        const data = await ReportModel.getDailyProfit();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCategoryProfit = async (req: Request, res: Response) => {
    try {
        const data = await ReportModel.getCategoryProfit();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
