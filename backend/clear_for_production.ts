import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function clearForProduction() {
    await client.connect();

    try {
        await client.query('BEGIN');

        console.log("Starting production data reset...");

        // 1. Truncate transactional and inventory data cleanly.
        // CASCADE ensures dependent records are wiped automatically, although we are wiping them all anyway.
        await client.query('TRUNCATE TABLE low_stock_alerts CASCADE');
        await client.query('TRUNCATE TABLE bill_items CASCADE');
        await client.query('TRUNCATE TABLE bills CASCADE');
        await client.query('TRUNCATE TABLE stock CASCADE');
        await client.query('TRUNCATE TABLE products CASCADE');

        console.log("Transactional and product data wiped.");

        // 2. Clear out the test brands
        await client.query('TRUNCATE TABLE brands CASCADE');

        console.log("Brands table wiped.");

        // 3. Seed new famous brands
        const brands = [
            'Nike',
            'Adidas',
            'Puma',
            'Reebok',
            'Bata',
            'Skechers',
            'Campus',
            'Crocs',
            'Woodland',
            'Asics',
            'Sparx',
            'Red Tape'
        ];

        const insertQuery = `INSERT INTO brands (name) VALUES ($1)`;

        for (const brand of brands) {
            await client.query(insertQuery, [brand]);
        }

        console.log("Seeded", brands.length, "famous brands successfully.");

        await client.query('COMMIT');
        console.log("Production reset complete.");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error during reset:", e);
    } finally {
        await client.end();
    }
}

clearForProduction();
