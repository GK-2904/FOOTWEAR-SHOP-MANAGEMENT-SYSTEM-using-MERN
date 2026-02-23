import { query } from '../config/db.js';

export const ReportModel = {
    async getCustomerProfit() {
        const res = await query(`
      SELECT b.customer_name, COUNT(DISTINCT b.id) as total_bills,
             SUM(bi.quantity) as total_items,
             SUM(bi.total) as total_revenue,
             SUM(bi.total - (bi.purchase_price * bi.quantity)) as total_profit
      FROM bills b
      JOIN bill_items bi ON b.id = bi.bill_id
      WHERE b.customer_name IS NOT NULL AND b.customer_name != '' AND bi.status != 'returned'
      GROUP BY b.customer_name
      ORDER BY total_profit DESC
    `);
        return res.rows;
    },

    async getProductProfit() {
        const res = await query(`
      SELECT p.name as product_name, p.sub_brand, 
             SUM(bi.quantity) as items_sold,
             SUM(bi.total) as total_revenue,
             SUM(bi.total - (bi.purchase_price * bi.quantity)) as total_profit
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.status != 'returned'
      GROUP BY p.id, p.name, p.sub_brand
      ORDER BY total_profit DESC
    `);
        return res.rows;
    },

    async getMonthlyProfit() {
        const res = await query(`
      SELECT TO_CHAR(b.bill_date, 'YYYY-MM') as month,
             COUNT(DISTINCT b.id) as total_bills,
             SUM(bi.total) as total_revenue,
             SUM(bi.total - (bi.purchase_price * bi.quantity)) as total_profit
      FROM bills b
      JOIN bill_items bi ON b.id = bi.bill_id
      WHERE bi.status != 'returned'
      GROUP BY TO_CHAR(b.bill_date, 'YYYY-MM')
      ORDER BY month DESC
    `);
        return res.rows;
    },

    async getDailyProfit() {
        const res = await query(`
      SELECT TO_CHAR(b.bill_date, 'YYYY-MM-DD') as date,
             COUNT(DISTINCT b.id) as total_bills,
             SUM(bi.total) as total_revenue,
             SUM(bi.total - (bi.purchase_price * bi.quantity)) as total_profit
      FROM bills b
      JOIN bill_items bi ON b.id = bi.bill_id
      WHERE bi.status != 'returned'
      GROUP BY TO_CHAR(b.bill_date, 'YYYY-MM-DD')
      ORDER BY date DESC
    `);
        return res.rows;
    },

    async getCategoryProfit() {
        const res = await query(`
      SELECT c.name as category_name,
             SUM(bi.quantity) as items_sold,
             SUM(bi.total) as total_revenue,
             SUM(bi.total - (bi.purchase_price * bi.quantity)) as total_profit
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE bi.status != 'returned'
      GROUP BY c.id, c.name
      ORDER BY total_profit DESC
    `);
        return res.rows;
    }
};
