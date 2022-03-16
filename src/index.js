require('dotenv/config');
const express = require('express');
const apiRoutes = require('./routes/fees');
const errorMiddleware = require('./middleware/error');
const { mongoConnect, createIndexes } = require('./db');

const startServer = async () => {
  const app = express();

  /**
   * Verify that DB_URL is set in environment
   */
  if (!process.env.DB_URL) throw new Error('Fata Error: "DB_URL" not set.');

  const PORT = process.env.PORT || 3030;
  await mongoConnect(process.env.DB_URL);

  /**
   * Create indexes on fees collection
   */
  await createIndexes();

  app.use(express.json());
  app.use('/api', apiRoutes);
  app.use(errorMiddleware);
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();