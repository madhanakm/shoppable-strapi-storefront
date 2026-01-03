// API Routes for Admin Panel Integration
import express from 'express';
import cors from 'cors';
import { productRoutes } from './routes/products';
import { categoryRoutes } from './routes/categories';
import { orderRoutes } from './routes/orders';
import { userRoutes } from './routes/users';
import { settingsRoutes } from './routes/settings';
import { authMiddleware } from './middleware/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

export default app;