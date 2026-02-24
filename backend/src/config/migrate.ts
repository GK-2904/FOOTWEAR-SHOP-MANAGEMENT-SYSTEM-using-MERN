import pool from './db.js';

export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');
    await client.query('BEGIN');

    // 1. Update products table
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sub_brand VARCHAR(100),
      ADD COLUMN IF NOT EXISTS article VARCHAR(100),
      ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
      ADD COLUMN IF NOT EXISTS is_ready_for_sale BOOLEAN DEFAULT false
    `);

    // Rename cost_price to purchase_price if it exists
    const checkCostPrice = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='cost_price'
    `);
    if (checkCostPrice.rows.length > 0) {
      await client.query(`ALTER TABLE products RENAME COLUMN cost_price TO purchase_price`);
    }

    // 2. Update bills table
    await client.query(`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash',
      ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)
    `);

    // 3. Update bill_items table
    await client.query(`
      ALTER TABLE bill_items 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sold',
      ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10, 2) DEFAULT 0
    `);

    await client.query('COMMIT');
    console.log('Migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
  }
};

// Run automatically if this file is executed directly
runMigrations().then(() => {
  console.log('Finished migrating missing database columns');
  process.exit(0);
}).catch(console.error);
