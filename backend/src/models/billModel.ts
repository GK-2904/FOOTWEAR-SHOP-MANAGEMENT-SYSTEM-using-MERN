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
      SELECT bi.*, p.name as product_name, b.name as brand_name, 
             p.sub_brand as sub_brand, p.article as article, p.gender as gender,
             p.type as product_type, c.name as category_name
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
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
        const { product_id, size, quantity, price, mrp, purchase_price, total } = item;

        // Insert bill item
        await client.query(`
          INSERT INTO bill_items (bill_id, product_id, size, quantity, price, mrp, purchase_price, total)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [billId, product_id, size, quantity, price, mrp || 0, purchase_price || 0, total]);

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

      // 1. Get the item to be returned
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

      // 4. Fetch the Bill
      const billRes = await client.query('SELECT * FROM bills WHERE id = $1', [item.bill_id]);
      if (billRes.rows.length === 0) {
        throw new Error('Bill not found');
      }
      const bill = billRes.rows[0];

      // 5. Fetch all remaining items on the Bill
      const remainingItemsRes = await client.query(`
        SELECT bi.*, p.gst_percent 
        FROM bill_items bi
        JOIN products p ON bi.product_id = p.id
        WHERE bi.bill_id = $1 AND bi.status != 'returned'
      `, [item.bill_id]);

      const remainingItems = remainingItemsRes.rows;

      // 6. Recalculate Subtotal and GST Amount securely
      let newSubtotal = 0;
      let newGstAmount = 0;

      for (const remItem of remainingItems) {
        const itemTotal = parseFloat(remItem.total);
        newSubtotal += itemTotal;
        newGstAmount += (itemTotal * parseFloat(remItem.gst_percent || bill.gst_percent || 0)) / 100;
      }

      // 7. Recalculate Discount 
      const discountPercent = parseFloat(bill.discount_percent || 0);
      const newDiscountAmount = (newSubtotal * discountPercent) / 100;

      // 8. Recalculate new total amount
      const newTotalAmount = newSubtotal + newGstAmount - newDiscountAmount;

      // 9. Update the Bill
      await client.query(`
        UPDATE bills 
        SET subtotal = $1, gst_amount = $2, discount_amount = $3, total_amount = $4 
        WHERE id = $5
      `, [
        Math.max(0, newSubtotal),
        Math.max(0, newGstAmount),
        Math.max(0, newDiscountAmount),
        Math.max(0, newTotalAmount),
        item.bill_id
      ]);

      await client.query('COMMIT');
      return { success: true, message: 'Item returned successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async replaceItem(billItemId: number, newItem: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get the old item
      const itemRes = await client.query("SELECT * FROM bill_items WHERE id = $1 AND status != 'returned'", [billItemId]);
      if (itemRes.rows.length === 0) {
        throw new Error('Item not found or already returned');
      }
      const oldItem = itemRes.rows[0];

      // 2. Mark old item as returned
      await client.query("UPDATE bill_items SET status = 'returned' WHERE id = $1", [billItemId]);

      // 3. Restore old stock
      await client.query(`
        UPDATE stock SET quantity = quantity + $1 WHERE product_id = $2 AND size = $3
      `, [oldItem.quantity, oldItem.product_id, oldItem.size]);

      // 4. Validate and deduct new stock
      const stockRes = await client.query(`
        SELECT quantity FROM stock WHERE product_id = $1 AND size = $2
      `, [newItem.product_id, newItem.size]);

      if (stockRes.rows.length === 0 || stockRes.rows[0].quantity < newItem.quantity) {
        throw new Error('Insufficient stock for replacement item');
      }

      await client.query(`
        UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2 AND size = $3
      `, [newItem.quantity, newItem.product_id, newItem.size]);

      // 5. Insert the new item
      await client.query(`
        INSERT INTO bill_items (bill_id, product_id, size, quantity, price, mrp, purchase_price, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [oldItem.bill_id, newItem.product_id, newItem.size, newItem.quantity, newItem.price, newItem.mrp || 0, newItem.purchase_price || 0, newItem.total]);

      // 6. Fetch the Bill
      const billRes = await client.query('SELECT * FROM bills WHERE id = $1', [oldItem.bill_id]);
      if (billRes.rows.length === 0) {
        throw new Error('Bill not found');
      }
      const bill = billRes.rows[0];

      // 7. Fetch all remaining items on the Bill (this now includes the newly inserted item)
      const remainingItemsRes = await client.query(`
        SELECT bi.*, p.gst_percent 
        FROM bill_items bi
        JOIN products p ON bi.product_id = p.id
        WHERE bi.bill_id = $1 AND bi.status != 'returned'
      `, [oldItem.bill_id]);

      const remainingItems = remainingItemsRes.rows;

      // 8. Recalculate Subtotal and GST Amount securely
      let newSubtotal = 0;
      let newGstAmount = 0;

      for (const remItem of remainingItems) {
        const itemTotal = parseFloat(remItem.total);
        newSubtotal += itemTotal;
        newGstAmount += (itemTotal * parseFloat(remItem.gst_percent || bill.gst_percent || 0)) / 100;
      }

      // 9. Recalculate Discount 
      const discountPercent = parseFloat(bill.discount_percent || 0);
      const newDiscountAmount = (newSubtotal * discountPercent) / 100;

      // 10. Recalculate new total amount
      const newTotalAmount = newSubtotal + newGstAmount - newDiscountAmount;

      // 11. Update the Bill
      await client.query(`
        UPDATE bills 
        SET subtotal = $1, gst_amount = $2, discount_amount = $3, total_amount = $4 
        WHERE id = $5
      `, [
        Math.max(0, newSubtotal),
        Math.max(0, newGstAmount),
        Math.max(0, newDiscountAmount),
        Math.max(0, newTotalAmount),
        oldItem.bill_id
      ]);

      await client.query('COMMIT');
      return { success: true, message: 'Item replaced successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
