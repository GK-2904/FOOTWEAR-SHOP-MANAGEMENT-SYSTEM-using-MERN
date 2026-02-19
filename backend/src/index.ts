import dns from 'node:dns';

// MONKEY PATCH: Force IPv4 for everything
const originalLookup = dns.lookup;
(dns as any).lookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  options.family = 4; // FORCE IPv4
  return originalLookup(hostname, options, callback);
};

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { initializeDatabase } from './config/init_db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
initializeDatabase().catch(err => console.error('DB Init Error:', err));

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Footwear Shop Management System API');
});

import pool from './config/db.js';

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
