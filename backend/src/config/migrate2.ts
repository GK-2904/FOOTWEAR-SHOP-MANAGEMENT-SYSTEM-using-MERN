import pool from './db.js';

export const migrateExpiryDates = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add mfg_date and expiry_date parameters
        await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS mfg_date DATE,
      ADD COLUMN IF NOT EXISTS expiry_date DATE;
    `);

        // Drop is_ready_for_sale parameter
        await client.query(`
      ALTER TABLE products
      DROP COLUMN IF EXISTS is_ready_for_sale;
    `);

        await client.query('COMMIT');
        console.log('Migration for Expiry Dates completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error migrating expiry dates schema:', err);
    } finally {
        client.release();
    }
};

migrateExpiryDates().then(() => {
    console.log('Finished running expiry date migration');
    process.exit(0);
}).catch(console.error);
