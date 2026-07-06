import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(process.cwd(), nodeEnv === 'production' ? '.env.production' : '.env.development')
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3005),
  ENV_NAME: z.string().default('development'),
  MONGO_URI: z.string().url().default('mongodb://127.0.0.1:27017/inspired'),
  JWT_ACCESS_SECRET: z.string().default('access-secret-minimum-32-chars-length'),
  JWT_REFRESH_SECRET: z.string().default('refresh-secret-minimum-32-chars-length'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  // Cloudflare R2 / S3-compatible storage
  R2_ENDPOINT: z.string().url().default('https://placeholder.r2.cloudflarestorage.com'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default('meditailor'),
  CLOUDFRONT_DOMAIN: z.string().url().default('https://placeholder.r2.cloudflarestorage.com/meditailor'),
  // Admin signup gate — set to true ONLY when you need to create a new admin (recovery)
  ALLOW_ADMIN_SIGNUP: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables configuration:', parsed.error.format());
  process.exit(1);
}

export const ENV = Object.freeze(parsed.data);
export type EnvConfig = typeof ENV;
export default ENV;
