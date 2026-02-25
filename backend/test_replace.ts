import { Client } from 'pg';
import dotenv from 'dotenv';
import { BillModel } from './build/src/models/billModel.js';
dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function testReplace() {
    await client.connect();

    try {
        const biRes = await client.query('SELECT * FROM bill_items LIMIT 5');
        console.log('Sample items:', biRes.rows);

        // Choose an item to replace
        if (biRes.rows.length > 0) {
            const itemToReplace = biRes.rows.find(i => i.status !== 'returned');
            if (itemToReplace) {
                console.log("Found item to replace", itemToReplace.id, "from bill", itemToReplace.bill_id);

                // Just simulate a "new" item. I'll pass some static data for now.
                const pRes = await client.query('SELECT * FROM products LIMIT 1');
                const pt = pRes.rows[0];

                console.log("Replacing with item:", pt.id);

                await BillModel.replaceItem(itemToReplace.id, {
                    product_id: pt.id,
                    size: '8',
                    quantity: 1,
                    price: 1500,
                    mrp: 1800,
                    purchase_price: 1000,
                    total: 1500
                });

                const res = await client.query('SELECT * FROM bills WHERE id = $1', [itemToReplace.bill_id]);
                console.log('Bill After Replacement:', res.rows.map(b => ({
                    id: b.id,
                    subtotal: b.subtotal,
                    gst: b.gst_amount,
                    discount: b.discount_amount,
                    total: b.total_amount
                })));
            } else {
                console.log("No non-returned items available in sample");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

testReplace();
