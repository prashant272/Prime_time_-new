import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import config from './config/env.js';

import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';
import nominationRoutes from './routes/nomination.routes.js';
import blogRoutes from './routes/blog.routes.js';
import awardRoutes from './routes/award.routes.js';

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render load balancer)

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Professional CORS Configuration
const allowedOrigins = [...config.clientUrls].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Remove trailing slashes for robust matching
    const sanitizedOrigin = origin ? origin.replace(/\/$/, '') : origin;
    const sanitizedAllowedOrigins = allowedOrigins.map(url => url.replace(/\/$/, ''));

    // Allow requests with no origin (like Postman or curl)
    if (!sanitizedOrigin) {
      return callback(null, true);
    }

    // Check if the incoming origin is in our allowed list
    if (sanitizedAllowedOrigins.includes(sanitizedOrigin)) {
      return callback(null, true);
    }

    // Reject the request if origin is not allowed
    console.error(`CORS BLOCKED: Incoming origin '${sanitizedOrigin}' is not in allowed list:`, sanitizedAllowedOrigins);
    return callback(new Error('CORS policy violation: This origin is not permitted.'), false);
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',

  ],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200, // Provide support for legacy browsers (IE11, various SmartTVs)
  maxAge: 86400, // Cache preflight requests for 24 hours to improve speed
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/nominations', nominationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/awards', awardRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const PORT = config.port;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
=========================================
🚀 SERVER STARTED SUCCESSFULLY!
=========================================
📡 Port        : ${PORT}
🔗 URL         : http://localhost:${PORT}
🌍 Environment : ${config.env.toUpperCase()}
=========================================
    `);
  });
});
