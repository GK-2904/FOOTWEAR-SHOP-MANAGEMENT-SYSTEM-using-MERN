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
        discount_percent, discount_amount, total_amount, created_by,
        payment_method, customer_name
      } = billData;

      const billRes = await client.query(`
        INSERT INTO bills 
        (bill_number, subtotal, gst_percent, gst_amount, discount_percent, discount_amount, total_amount, created_by, payment_method, customer_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [bill_number, subtotal, gst_percent, gst_amount, discount_percent, discount_amount, total_amount, created_by, payment_method, customer_name]);

      const billId = billRes.rows[0].id;

      for (const item of items) {
        const { product_id, size, quantity, price, purchase_price, total } = item;

        // Insert bill item
        await client.query(`
          INSERT INTO bill_items (bill_id, product_id, size, quantity, price, purchase_price, total)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [billId, product_id, size, quantity, price, purchase_price || 0, total]);

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
  },

  async returnItem(billItemId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get the item
      const itemRes = await client.query("SELECT * FROM bill_items WHERE id = $1 AND status != 'returned'", [billItemId]);
      if (itemRes.rows.length === 0) {
        throw new Error('Item not found or already returned');
      }
      const item = itemRes.rows[0];

      // 2. Mark as returned
      await client.query("UPDATE bill_items SET status = 'returned' WHERE id = $1", [billItemId]);

      // 3. Restore stock
      await client.query(`
        UPDATE stock SET quantity = quantity + $1 WHERE product_id = $2 AND size = $3
      `, [item.quantity, item.product_id, item.size]);

      // 4. Calculate amount to deduct from bill
      const amountToDeduct = parseFloat(item.total);

      // 5. Update Bill
      const billRes = await client.query('SELECT * FROM bills WHERE id = $1', [item.bill_id]);
      const bill = billRes.rows[0];

      // For simplicity, we just deduct from total_amount and subtotal.
      // If there are complex gst/discounts, it gets tricky, but we proportionally reduce it.
      const newSubtotal = parseFloat(bill.subtotal) - amountToDeduct;
      const newTotal = parseFloat(bill.total_amount) - amountToDeduct; // Simple deduction
      // Assuming discount and GST on this item is bundled into its 'total' or we just deduct the raw amount from final bill.

      await client.query(`
        UPDATE bills 
        SET subtotal = $1, total_amount = $2 
        WHERE id = $3
      `, [Math.max(0, newSubtotal), Math.max(0, newTotal), item.bill_id]);

      await client.query('COMMIT');
      return { success: true, message: 'Item returned successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
