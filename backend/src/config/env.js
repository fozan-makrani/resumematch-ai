// Validates required env vars exist at startup, instead of failing
// randomly deep in some unrelated request handler later.
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = validateEnv;