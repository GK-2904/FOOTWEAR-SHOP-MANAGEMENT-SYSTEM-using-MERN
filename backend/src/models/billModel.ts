import { query } from '../config/db.js';
import pool from '../config/db.js';

export const BillModel = {
  async getAll() {
    const res = await query('SELECT * FROM bills ORDER BY bill_date DESC');
    return res.rows;
  },

  async getById(id: number) {
    const billRes = await query('SELECT * FROM bills WHERE id = $1', [id]);
    const itemsRes = await query(`
      SELECT bi.*, p.name as product_name, b.name as brand_name
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      WHERE bi.bill_id = $1
    `, [id]);
    
    if (billRes.rows.length === 0) return null;
    
    return {
      ...billRes.rows[0],
      items: itemsRes.rows
    };
  },

  async create(billData: any, items: any[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const {
        bill_number, subtotal, gst_percent, gst_amount, 
        discount_percent, discount_amount, total_amount, created_by
      } = billData;
      
      const billRes = await client.query(`
        INSERT INTO bills 
        (bill_number, subtotal, gst_percent, gst_amount, discount_percent, discount_amount, total_amount, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [bill_number, subtotal, gst_percent, gst_amount, discount_percent, discount_amount, total_amount, created_by]);
      
      const billId = billRes.rows[0].id;
      
      for (const item of items) {
        const { product_id, size, quantity, price, total } = item;
        
        // Insert bill item
        await client.query(`
          INSERT INTO bill_items (bill_id, product_id, size, quantity, price, total)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [billId, product_id, size, quantity, price, total]);
        
        // Deduct from stock
        await client.query(`
          UPDATE stock 
          SET quantity = quantity - $1
          WHERE product_id = $2 AND size = $3
        `, [quantity, product_id, size]);
      }
      
      await client.query('COMMIT');
      return billRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
