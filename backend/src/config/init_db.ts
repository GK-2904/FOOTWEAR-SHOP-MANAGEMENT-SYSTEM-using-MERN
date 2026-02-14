import pool from './db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Check if database is already initialized
    const checkTable = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins')");
    if (checkTable.rows[0].exists) {
      console.log('Database already initialized, skipping...');
      return;
    }

    const sql = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf8');
    
    // Hash the default admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Replace placeholder in SQL
    const finalSql = sql.replace('$2b$10$YourHashedPasswordHere', hashedPassword);
    
    await client.query(finalSql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

// If this script is run directly
if (process.argv[1] === __filename) {
  initializeDatabase().then(() => process.exit());
}
