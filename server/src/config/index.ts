import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/moveinsync-pulse',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  aiProvider: process.env.AI_PROVIDER || 'none', // 'openai' | 'gemini' | 'none'
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  demoMode: process.env.DEMO_MODE !== 'false', // default true
};

export default config;
