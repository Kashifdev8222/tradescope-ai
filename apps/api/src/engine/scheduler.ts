import cron from 'node-cron';
import { runAIEngine } from './mock-ai-engine.js';
import { updateAllPrices } from './mock-market-data.js';
import { config } from '../config/index.js';

let aiJob: cron.ScheduledTask | null = null;
let priceInterval: ReturnType<typeof setInterval> | null = null;

export function startScheduler() {
  // Price ticker — runs every 1 second for smooth charts
  if (!priceInterval) {
    priceInterval = setInterval(() => {
      updateAllPrices();
    }, 1000);
    console.log('[Scheduler] Price ticker started (1s interval)');
  }

  // AI engine — runs on cron
  if (aiJob) {
    console.log('[Scheduler] AI engine job already running');
    return;
  }

  aiJob = cron.schedule(config.ai.cronInterval, async () => {
    console.log(`[Scheduler] AI engine tick at ${new Date().toISOString()}`);
    try {
      await runAIEngine();
    } catch (err) {
      console.error('[Scheduler] AI engine error:', err);
    }
  });

  console.log(`[Scheduler] AI engine scheduled with cron: ${config.ai.cronInterval}`);
  runAIEngine().catch((err) => console.error('[Scheduler] Initial AI engine error:', err));
}

export function stopScheduler() {
  if (aiJob) { aiJob.stop(); aiJob = null; }
  if (priceInterval) { clearInterval(priceInterval); priceInterval = null; }
}
