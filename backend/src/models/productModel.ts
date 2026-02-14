import { query } from '../config/db.js';

export const ProductModel = {
  async getAll() {
    const res = await query(`
      SELECT p.*, b.name as brand_name, c.name as category_name,
      s.size, s.quantity
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      ORDER BY p.id DESC
    `);
    return res.rows;
  },

  async getById(id: number) {
    const res = await query(`
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    return res.rows[0];
  },

  async create(data: any) {
    const {
      brand_id, category_id, name, type, color, section, rack, shelf, cost_price, selling_price
    } = data;
    const res = await query(`
      INSERT INTO products 
      (brand_id, category_id, name, type, color, section, rack, shelf, cost_price, selling_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [brand_id, category_id, name, type, color, section, rack, shelf, cost_price, selling_price]);
    return res.rows[0];
  },

  async update(id: number, data: any) {
    const {
      brand_id, category_id, name, type, color, section, rack, shelf, cost_price, selling_price
    } = data;
    const res = await query(`
      UPDATE products 
      SET brand_id = $1, category_id = $2, name = $3, type = $4, color = $5, 
          section = $6, rack = $7, shelf = $8, cost_price = $9, selling_price = $10,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [brand_id, category_id, name, type, color, section, rack, shelf, cost_price, selling_price, id]);
    return res.rows[0];
  },

  async delete(id: number) {
    const res = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};
