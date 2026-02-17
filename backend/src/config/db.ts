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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_URL
    ? {
      ssl: {
        rejectUnauthorized: false,
      },
      family: 4,
    }
    : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      family: 4,
    }),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
