import { createApp } from './app.js';
import { config } from './config/index.js';
import { startScheduler } from './engine/scheduler.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 TradeScope AI API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Health check: http://localhost:${config.port}/api/v1/health`);

  // Start the mock AI engine scheduler
  if (config.nodeEnv !== 'test') {
    startScheduler();
    console.log('   AI Engine scheduler started');
  }
});
