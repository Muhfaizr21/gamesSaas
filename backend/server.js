const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.urlencoded({ extended: true }));

// Serve static files (gambar produk, dll)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const publicRoutes = require('./routes/publicRoutes');
const writerRoutes = require('./routes/writerRoutes');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

const tenantMiddleware = require('./middlewares/tenantMiddleware');
const masterRoutes = require('./routes/masterRoutes');

// --- Master Route (Superadmin, Tidak pakai Tenant Middleware!) ---
app.use('/api/master', masterRoutes);

// --- Tenant Routes (Akan dicek oleh Middleware) ---
app.use('/api/auth', tenantMiddleware, authRoutes);
app.use('/api/admin', tenantMiddleware, adminRoutes);
app.use('/api/checkout', tenantMiddleware, checkoutRoutes);
app.use('/api/public', tenantMiddleware, publicRoutes);
app.use('/api/writer', tenantMiddleware, writerRoutes);

// Basic Testing Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Topup Platform SaaS API' });
});

// Centralized Error Handler (Must be last)
app.use(errorHandler);

// Database Sync & Start Server
const masterSequelize = require('./config/masterDatabase');
masterSequelize.authenticate().then(() => {
  logger.success('Control Plane (Master DB) connected successfully');
  app.listen(PORT, () => {
    logger.info(`🚀 SaaS Data Plane is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  logger.error('Failed to connect Master DB: ' + err.message);
});
