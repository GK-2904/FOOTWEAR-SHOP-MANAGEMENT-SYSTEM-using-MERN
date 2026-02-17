import pool from './db.js';
import bcrypt from 'bcryptjs';

const INIT_SQL = \`
-- Footwear Shop Management System - Database Schema

-- Drop tables if they exist
DROP TABLE IF EXISTS low_stock_alerts;
DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS stock;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS admins;

-- Admin Table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- Sports, Casual, etc.
    color VARCHAR(50),
    section VARCHAR(50),
    rack VARCHAR(50),
    shelf VARCHAR(50),
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Table
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    UNIQUE(product_id, size)
);

-- Bills Table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    bill_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    gst_percent DECIMAL(5, 2) DEFAULT 0,
    gst_amount DECIMAL(10, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_by INTEGER REFERENCES admins(id)
);

-- Bill Items Table
CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Low Stock Alerts Table
CREATE TABLE low_stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    threshold INTEGER DEFAULT 5,
    UNIQUE(product_id, size)
);

-- Initial Data
INSERT INTO admins (username, password) VALUES ('admin', '$2b$10$YourHashedPasswordHere'); -- admin123 hashed

INSERT INTO categories (name) VALUES ('Men'), ('Women'), ('Kids');

INSERT INTO brands (name) VALUES ('Nike'), ('Adidas'), ('Puma'), ('Reebok'), ('Bata');
\`;

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Check if database is already initialized
    const checkTable = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins')");
    if (checkTable.rows[0].exists) {
      console.log('Database already initialized, skipping...');
      return;
    }

    // Hash the default admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Replace placeholder in SQL
    const finalSql = INIT_SQL.replace('$2b$10$YourHashedPasswordHere', hashedPassword);
    
    await client.query(finalSql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};
