const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { query } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing for Web and Mobile clients
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API (checks database and PostGIS status)
app.get('/api/health', async (req, res, next) => {
  try {
    const dbResult = await query(`
      SELECT 
        NOW() AS server_time, 
        current_database() AS database,
        PostGIS_Version() AS postgis_version,
        (SELECT COUNT(*) FROM places) AS total_places;
    `);

    res.status(200).json({
      status: 'healthy',
      message: 'Explore Sri Lanka API is operational',
      database: {
        connected: true,
        name: dbResult.rows[0].database,
        postgis: dbResult.rows[0].postgis_version,
        total_places: parseInt(dbResult.rows[0].total_places, 10),
        server_time: dbResult.rows[0].server_time,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Mount API Routes
const placeRoutes = require('./routes/placeRoutes');
app.use('/api/places', placeRoutes);

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Explore Sri Lanka API',
    version: '1.0.0',
    description: 'Tourism & PostGIS Geolocation REST API',
    endpoints: {
      health: '/api/health',
      places: '/api/places',
      nearby: '/api/places/nearby?lat=6.9271&lng=79.8612&radius=25',
      search: '/api/places/search?q=Ella',
      metadata: '/api/places/metadata',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
