import { query } from '../config/db.js';

export const BrandModel = {
  async getAll() {
    const res = await query('SELECT * FROM brands ORDER BY name ASC');
    return res.rows;
  },

  async create(name: string) {
    const res = await query('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);
    return res.rows[0];
  },

  async update(id: number, name: string) {
    const res = await query('UPDATE brands SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    return res.rows[0];
  },

  async delete(id: number) {
    const res = await query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};
