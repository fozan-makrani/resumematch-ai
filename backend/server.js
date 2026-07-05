require('dotenv').config();
const validateEnv = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Fail fast if config is broken, before touching the network or DB
validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer();