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

  async updateSpecificStock(productId: number, oldSize: string, newSize: string, quantity: number) {
    if (oldSize && oldSize !== newSize) {
      const check = await query('SELECT * FROM stock WHERE product_id = $1 AND size = $2', [productId, newSize]);
      if (check.rows.length > 0) {
        await query('DELETE FROM stock WHERE product_id = $1 AND size = $2', [productId, oldSize]);
        return await this.setStock(productId, newSize, quantity);
      } else {
        const res = await query(`
          UPDATE stock
          SET size = $3, quantity = $4
          WHERE product_id = $1 AND size = $2
          RETURNING *
        `, [productId, oldSize, newSize, quantity]);
        return res.rows[0];
      }
    }
    return await this.setStock(productId, newSize, quantity);
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
  },

  async deleteStock(productId: number, size: string) {
    const res = await query('DELETE FROM stock WHERE product_id = $1 AND size = $2 RETURNING *', [productId, size]);
    return res.rows[0];
  }
};
