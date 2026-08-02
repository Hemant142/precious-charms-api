import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadEnv, maskMongoUri } from './config/env';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const logger = new Logger('Bootstrap');

  const envInfo = loadEnv();

  if (!isProd) {
    console.log('========== .env load ==========');
    console.log('env path:', envInfo.envPath);
    console.log('env file exists:', envInfo.exists);
    console.log('keys loaded from .env:', envInfo.loadedKeys);
    if (envInfo.error) {
      console.error('.env load error:', envInfo.error);
    }
    console.log(
      'process.env.MONGODB_URI (masked):',
      maskMongoUri(process.env.MONGODB_URI),
    );
    console.log('process.env.PORT:', process.env.PORT ?? '(not set)');
    console.log('===============================');
  } else {
    logger.log(
      `env loaded=${envInfo.exists} mongo=${maskMongoUri(process.env.MONGODB_URI)}`,
    );
  }

  if (!process.env.MONGODB_URI) {
    logger.error(
      'MONGODB_URI is missing. Set it in the environment (Render dashboard / .env).',
    );
  }

  // Buffer logs in production to reduce overhead on small instances
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? ['error', 'warn', 'log'] : undefined,
    bufferLogs: isProd,
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3000;
  // Bind 0.0.0.0 so Render / cloud port scanners can reach the service
  await app.listen(port, '0.0.0.0');
  logger.log(`API listening on 0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Failed to start:', err);
  process.exit(1);
});
