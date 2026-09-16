require('dotenv').config();
const http = require('http');
const app = require('./app');
const { testConnection, pool } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  console.log('🚀 Starting Explore Sri Lanka API server...');

  // Test database connection before opening port
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️  Warning: Database connection could not be established at launch.');
    console.warn('   Ensure PostgreSQL service is running and credentials in .env are correct.');
  }

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    try {
      await pool.end();
      console.log('🔌 PostgreSQL pool disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
