import { Pool } from 'pg';
import type { CachedWeather } from '../shared/weather.js';

export const cacheDurationMs = 10 * 60 * 1000;

export class ConfigurationError extends Error {}

export class WeatherCache {
  private readonly pool: Pool;

  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) {
      throw new ConfigurationError('DATABASE_URL must be set to use the PostgreSQL weather cache.');
    }
    this.pool = new Pool({ connectionString });
  }

  async initialize(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        cache_key TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    await this.pool.query('CREATE INDEX IF NOT EXISTS weather_cache_expires_at_idx ON weather_cache (expires_at)');
  }

  async get(key: string): Promise<CachedWeather | null> {
    const result = await this.pool.query<{ payload: CachedWeather }>(
      'SELECT payload FROM weather_cache WHERE cache_key = $1 AND expires_at > NOW()',
      [key]
    );
    return result.rows[0]?.payload ?? null;
  }

  async set(key: string, payload: CachedWeather): Promise<void> {
    await this.pool.query(
      `INSERT INTO weather_cache (cache_key, payload, expires_at)
       VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 millisecond'))
       ON CONFLICT (cache_key) DO UPDATE
       SET payload = EXCLUDED.payload, created_at = NOW(), expires_at = EXCLUDED.expires_at`,
      [key, JSON.stringify(payload), cacheDurationMs]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
