import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/adminModel.js';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const admin = await AdminModel.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        name: 'Administrator' // Default name for the admin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const admin = await AdminModel.findById((req as any).user.id);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: admin.id,
      username: admin.username,
      name: 'Administrator'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
