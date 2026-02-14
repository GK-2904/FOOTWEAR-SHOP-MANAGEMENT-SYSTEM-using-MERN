# Footwear Shop Management System - Migration to PostgreSQL

This project has been migrated from LocalStorage to a full-stack architecture using Node.js, Express.js, and PostgreSQL.

## Backend Setup

### Prerequisites
- Node.js installed
- PostgreSQL installed and running locally

### Configuration
1. Navigate to the `backend` directory.
2. Open the `.env` file.
3. Update the database credentials:
   ```
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=footwear_shop
   JWT_SECRET=your_secure_jwt_secret
   ```

### Database Initialization
The backend is configured to automatically create the required tables and initial data on the first run. Ensure you have created a database named `footwear_shop` in PostgreSQL before starting the server.

### Running the Backend
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

## Frontend Setup

### Configuration
The frontend is already configured to connect to `http://localhost:5000/api`.

### Running the Frontend
```bash
cd FootwearShop-Management-System-main
npm install
npm run dev
```
The application will be available at the URL provided by Vite (usually `http://localhost:5173`).

## Project Structure
- `backend/src/config`: Database connection and initialization.
- `backend/src/models`: Database queries.
- `backend/src/controllers`: API logic.
- `backend/src/routes`: API endpoints.
- `backend/src/middleware`: Authentication and validation.

## Default Credentials
- **Username:** `admin`
- **Password:** `admin123`

## Database Schema
The SQL schema can be found in `backend/src/config/init_db.sql`.
Tables included:
- `admins`: Stores administrator credentials.
- `brands`: Brand management.
- `categories`: Product categories (Men, Women, Kids).
- `products`: Product details.
- `stock`: Size-wise quantity for products.
- `bills`: Sales records.
- `bill_items`: Items included in bills.
- `low_stock_alerts`: (Configured via Stock model queries).
