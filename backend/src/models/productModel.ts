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
      brand_id, category_id, name, sub_brand, article, type, color, section, rack, shelf, purchase_price, selling_price, gst_percent, gender, mfg_date, expiry_date
    } = data;
    const res = await query(`
      INSERT INTO products 
      (brand_id, category_id, name, sub_brand, article, type, color, section, rack, shelf, purchase_price, selling_price, gst_percent, gender, mfg_date, expiry_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [brand_id, category_id, name, sub_brand, article, type, color, section, rack, shelf, purchase_price, selling_price, gst_percent, gender, mfg_date || null, expiry_date || null]);
    return res.rows[0];
  },

  async update(id: number, data: any) {
    const {
      brand_id, category_id, name, sub_brand, article, type, color, section, rack, shelf, purchase_price, selling_price, gst_percent, gender, mfg_date, expiry_date
    } = data;
    const res = await query(`
      UPDATE products 
      SET brand_id = $1, category_id = $2, name = $3, sub_brand = $4, article = $5, type = $6, color = $7, 
          section = $8, rack = $9, shelf = $10, purchase_price = $11, selling_price = $12,
          gst_percent = $13, gender = $14, mfg_date = $15, expiry_date = $16,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING *
    `, [brand_id, category_id, name, sub_brand, article, type, color, section, rack, shelf, purchase_price, selling_price, gst_percent, gender, mfg_date || null, expiry_date || null, id]);
    return res.rows[0];
  },

  async delete(id: number) {
    // Delete associated stock first to prevent foreign key constraint errors
    await query('DELETE FROM stock WHERE product_id = $1', [id]);
    const res = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};
