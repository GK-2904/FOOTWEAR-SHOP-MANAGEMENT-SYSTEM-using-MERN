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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
