import { query } from './src/config/db.js';

const migrate = async () => {
    try {
        console.log("Adding mrp column to bill_items...");

        await query(`
        ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2) DEFAULT 0;
        `);

        console.log("Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
