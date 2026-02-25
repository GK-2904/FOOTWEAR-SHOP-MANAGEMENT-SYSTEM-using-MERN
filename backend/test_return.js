const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function test() {
    await client.connect();

    try {
        const biRes = await client.query('SELECT * FROM bill_items LIMIT 5');
        console.log('Sample items:', biRes.rows);

        // Attempt to initialize and return an item using the model
        const { BillModel } = require('./build/src/models/billModel.js');

        if (biRes.rows.length > 0) {
            const itemToReturn = biRes.rows.find(i => i.status !== 'returned');
            if (itemToReturn) {
                console.log("Found item to return", itemToReturn.id, "from bill", itemToReturn.bill_id);
                await BillModel.returnItem(itemToReturn.id);

                const res = await client.query('SELECT * FROM bills WHERE id = $1', [itemToReturn.bill_id]);
                console.log('Bill After:', res.rows.map(b => ({
                    id: b.id,
                    subtotal: b.subtotal,
                    gst: b.gst_amount,
                    discount: b.discount_amount,
                    total: b.total_amount
                })));
            } else {
                console.log("No items available to return in sample");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

test();
