import { query } from '../config/db.js';

export const AdminModel = {
  async findByUsername(username: string) {
    const res = await query('SELECT * FROM admins WHERE username = $1', [username]);
    return res.rows[0];
  },

  async findById(id: number) {
    const res = await query('SELECT id, username, created_at FROM admins WHERE id = $1', [id]);
    return res.rows[0];
  },
  
  async create(username: string, passwordHash: string) {
    const res = await query(
      'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );
    return res.rows[0];
  }
};
