import { query } from '../config/db.js';

export const CategoryModel = {
  async getAll() {
    const res = await query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  },

  async findByName(name: string) {
    const res = await query('SELECT * FROM categories WHERE name = $1', [name]);
    return res.rows[0];
  },

  async create(name: string) {
    const res = await query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    return res.rows[0];
  }
};
