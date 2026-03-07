const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS: Whitelist domain resmi saja, tolak yang lain ──────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://budi.localhost:3000',
  /^https?:\/\/([\w-]+\.)?localhost(:\d+)?$/,  // izinkan semua subdomain di localhost
  /^https?:\/\/([\w-]+\.)?samstore\.id$/, // izinkan semua subdomain samstore.id
];
app.use(cors({
  origin: (origin, callback) => {
    // Debug: Log origin agar terlihat di terminal backend
    if (origin) console.log(`[CORS Request] From Origin: ${origin}`);

    // izinkan tools seperti Postman / curl (origin = undefined) hanya di non-production
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);

    // Periksa apakah origin mengandung 'localhost' atau '127.0.0.1'
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isSamstore = /\.samstore\.id$/.test(origin) || origin === 'https://samstore.id';

    if (isLocal || isSamstore || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`[CORS REJECTED] Origin: ${origin}`);
    callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

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
const superAdminRoutes = require('./routes/superAdminRoutes');

// --- Super Admin Route (Pemilik Platform SaaS) ---
app.use('/api/superadmin', superAdminRoutes);

// --- Master Route (Legacy, tetap ada) ---
app.use('/api/master', masterRoutes);

// --- Global Webhooks (Tanpa Tenant Middleware) ---
app.post('/api/webhook/digiflazz', require('./controllers/checkoutController').digiflazzWebhook);

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

  // Inisialisasi schedule (Auto-Suspend Tenant)
  const cronJobs = require('./scripts/cronJobs');
  cronJobs.initCronJobs();

  app.listen(PORT, () => {
    logger.info(`🚀 SaaS Data Plane is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  logger.error('Failed to connect Master DB: ' + err.message);
});
