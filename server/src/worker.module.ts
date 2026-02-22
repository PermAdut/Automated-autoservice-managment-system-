import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { RedisModule } from './modules/RedisModule/redis.module';
import { QueueModule } from './modules/QueueModule/queue.module';

/**
 * Minimal module for the BullMQ worker process.
 * Loads only what the queue processors need — no HTTP controllers, no Swagger.
 *
 * Run separately from the API server:
 *   node dist/worker.js
 *
 * Scale independently by running multiple worker containers.
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    QueueModule,
  ],
})
export class WorkerModule {}
