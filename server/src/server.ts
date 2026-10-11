import mongoose from 'mongoose';
import app from './app';
import config from './config';

const start = async () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MoveInSync Pulse — Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Try MongoDB connection
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.log('⚠️  MongoDB not available — running in in-memory mode');
    console.log('   Data will be served from seed generator (not persisted)');
    console.log('   To enable persistence, set MONGODB_URI in .env');
    console.log('');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📊 API available at http://localhost:${config.port}/api`);
    console.log(`❤️  Health check: http://localhost:${config.port}/api/health`);
    console.log('');
    if (config.aiProvider === 'none') {
      console.log('ℹ️  AI provider not configured — using rule-based classification');
      console.log('   Set AI_PROVIDER and AI_API_KEY in .env to enable AI features');
    }
    console.log('');
  });
};

start();
