import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

console.log('--- Database Connection Test ---');

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is missing in .env file');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
console.log('Testing URL:', connectionString.replace(/:([^:@]+)@/, ':****@'));

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        const client = await pool.connect();
        console.log('Connected!');

        const res = await client.query('SELECT NOW() as current_time, version()');
        console.log('Query Result:', res.rows[0]);

        client.release();
        console.log('--- TEST SUCCESSFUL ---');
    } catch (err: any) {
        console.error('--- CONNECTION FAILED ---');
        console.error('Error:', err.message);
        if (err.code) console.error('Code:', err.code);
        if (err.detail) console.error('Detail:', err.detail);

        if (err.message.includes('password authentication failed')) {
            console.log('\nTIP: Your password is wrong. Reset it in Supabase and update .env');
        } else if (err.message.includes('getaddrinfo ENOTFOUND')) {
            console.log('\nTIP: The host URL is wrong. Check for typos in supabase.com');
        }
    } finally {
        await pool.end();
    }
}

testConnection();
