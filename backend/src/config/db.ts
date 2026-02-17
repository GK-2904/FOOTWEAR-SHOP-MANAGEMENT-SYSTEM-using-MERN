import dns from 'node:dns';
// Force IPv4
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if not supported in older node versions, but Render uses 20+
}

import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();

// Debug: Check if URL is loaded (Mask the password)
if (process.env.DATABASE_URL) {
  console.log('Database URL loaded:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));
} else {
  console.error('DATABASE_URL is missing!');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
