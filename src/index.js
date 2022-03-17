require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/fees');
const errorMiddleware = require('./middleware/error');
const { mongoConnect, createIndexes } = require('./db');

const startServer = async () => {
  const app = express();

  /**
   * Verify that DB_URL is set in environment
   */
  if (!process.env.DB_URL) throw new Error('Fatal Error: "DB_URL" not set.');
  await mongoConnect(process.env.DB_URL);

  /**
   * Create indexes on fees collection
   */
  await createIndexes();

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.use(compression());
  }
  app.use(cors())
  app.use(express.json());
  app.use('/api', apiRoutes);
  app.use(errorMiddleware);
  
  app.listen(5000, () => console.log(`Server running on port 5000`));
};

startServer();