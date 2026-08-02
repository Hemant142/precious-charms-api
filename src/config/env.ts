import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

/** Mask password in mongodb:// or mongodb+srv:// URIs for safe logging. */
export function maskMongoUri(uri?: string | null): string {
  if (!uri) return '(not set)';
  return uri.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:***@');
}

/**
 * Load `.env` from the project working directory before Nest bootstraps.
 * ConfigModule also loads it, but doing this first makes process.env
 * available in main.ts and in early factory logs.
 */
export function loadEnv(): {
  envPath: string;
  exists: boolean;
  loadedKeys: string[];
  error?: string;
} {
  const envPath = resolve(process.cwd(), '.env');
  const exists = existsSync(envPath);

  if (!exists) {
    return {
      envPath,
      exists: false,
      loadedKeys: [],
      error: `.env not found at ${envPath}`,
    };
  }

  const result = loadDotenv({ path: envPath, override: false });

  return {
    envPath,
    exists: true,
    loadedKeys: Object.keys(result.parsed ?? {}),
    error: result.error ? String(result.error) : undefined,
  };
}

export function logMongoConnectionDiagnostics(uri: string | undefined) {
  const isAtlas = Boolean(uri?.includes('mongodb+srv://'));
  const isLocalFallback =
    !uri || uri.includes('localhost') || uri.includes('127.0.0.1');

  console.log('========== ENV / Mongo diagnostics ==========');
  console.log('process.cwd():', process.cwd());
  console.log('MONGODB_URI present:', Boolean(uri));
  console.log('MONGODB_URI (masked):', maskMongoUri(uri));
  console.log('Target:', isAtlas ? 'MongoDB Atlas' : 'Local / other');
  console.log('Using localhost fallback:', isLocalFallback && !isAtlas);
  console.log('PORT:', process.env.PORT ?? '(default 3000)');
  console.log('=============================================');

  if (!uri) {
    console.error(
      '[Mongo] MONGODB_URI is missing. Check that .env exists in process.cwd() and contains MONGODB_URI=...',
    );
  } else if (isAtlas) {
    console.warn(
      '[Mongo] Connecting to Atlas. If this fails with "IP isn\'t whitelisted", add your IP in Atlas → Network Access.',
    );
  }
}
