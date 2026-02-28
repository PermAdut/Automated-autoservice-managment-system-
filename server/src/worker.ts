import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

config();

const logger = new Logger('Worker');

async function bootstrapWorker() {
  // Application context — no HTTP server, no ports
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  await app.init();

  logger.log('🔧 Notification worker started — listening for queue jobs');
  logger.log(`   Queue backend: Redis ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  logger.log(`   Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.log('Shutting down worker...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

bootstrapWorker().catch((err) => {
  logger.error('Worker failed to start', err);
  process.exit(1);
});
