import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis client wrapper using ioredis.
 *
 * Provides:
 * - Key-value caching with TTL
 * - Pub/Sub for real-time events (complement to WebSocket gateway)
 * - Token blacklist for JWT revocation
 * - Rate limiting counters
 *
 * Gracefully disables itself when REDIS_HOST is not configured.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  async onModuleInit() {
    const host = process.env.REDIS_HOST;
    if (!host) {
      this.logger.warn('REDIS_HOST not set — Redis disabled. Caching and queues require Redis.');
      return;
    }

    this.client = new Redis({
      host,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => Math.min(times * 100, 3000),
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on('connect', () => this.logger.log(`Redis connected: ${host}:${process.env.REDIS_PORT || 6379}`));

    try {
      await this.client.connect();
    } catch (err) {
      this.logger.error(`Redis connection failed: ${err}`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  /** Expose raw client for BullMQ connection sharing */
  getClient(): Redis | null {
    return this.client;
  }

  // ── String cache ──────────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    return (await this.client.exists(key)) > 0;
  }

  /** JSON cache helpers */
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // ── Increment (for rate limiting) ─────────────────────────────────────────

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.client) return 0;
    const val = await this.client.incr(key);
    if (val === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return val;
  }

  // ── Token blacklist (JWT revocation) ─────────────────────────────────────

  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    await this.set(`bl:${token}`, '1', ttlSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.exists(`bl:${token}`);
  }

  // ── Pub/Sub ───────────────────────────────────────────────────────────────

  async publish(channel: string, data: object): Promise<void> {
    if (!this.client) return;
    await this.client.publish(channel, JSON.stringify(data));
  }
}
