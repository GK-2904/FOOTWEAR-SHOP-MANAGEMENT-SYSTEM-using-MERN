import { query } from '../config/db.js';

export const StockModel = {
  async getByProductId(productId: number) {
    const res = await query('SELECT * FROM stock WHERE product_id = $1', [productId]);
    return res.rows;
  },

  async updateStock(productId: number, size: string, quantity: number) {
    // UPSERT pattern
    const res = await query(`
      INSERT INTO stock (product_id, size, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id, size)
      DO UPDATE SET quantity = stock.quantity + $3
      RETURNING *
    `, [productId, size, quantity]);
    return res.rows[0];
  },

  async setStock(productId: number, size: string, quantity: number) {
    const res = await query(`
      INSERT INTO stock (product_id, size, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id, size)
      DO UPDATE SET quantity = $3
      RETURNING *
    `, [productId, size, quantity]);
    return res.rows[0];
  },

  async getLowStock(threshold: number = 5) {
    const res = await query(`
      SELECT s.*, p.name as product_name, b.name as brand_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      WHERE s.quantity <= $1
    `, [threshold]);
    return res.rows;
  }
};
