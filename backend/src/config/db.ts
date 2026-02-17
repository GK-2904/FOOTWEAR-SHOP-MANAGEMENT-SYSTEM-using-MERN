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

let poolConfig;

if (process.env.DATABASE_URL) {
  const params = new URL(process.env.DATABASE_URL);
  poolConfig = {
    user: params.username,
    password: params.password,
    host: params.hostname,
    port: parseInt(params.port),
    database: params.pathname.split('/')[1],
    ssl: {
      rejectUnauthorized: false,
    },
    family: 4, // Explicitly force IPv4
  };
} else {
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    family: 4,
  };
}

const pool = new Pool(poolConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
