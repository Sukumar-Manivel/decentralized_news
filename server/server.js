const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');

const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const evidenceRoutes = require('./routes/evidence');
const paymentRoutes = require('./routes/payment');
const downloadRoutes = require('./routes/download');
const userRoutes = require('./routes/user');

const { initFreshnessCron } = require('./agents/freshnessAgent');

// Initialize the Express app
const app = express();

// Connect to the database
connectDB(env.MONGODB_URI).then(() => {
  // Start Freshness Agent background cron job after DB connects
  initFreshnessCron();
});

// Use Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use morgan for HTTP request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/user', userRoutes);

// Simple root route
app.get('/', (req, res) => {
  res.send('CitizenLens API is running...');
});

// Global Error Handler Middleware
// Catches all errors passed to next()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Start listening for incoming requests
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
