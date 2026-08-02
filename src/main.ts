import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadEnv, maskMongoUri } from './config/env';

async function bootstrap() {
  const envInfo = loadEnv();

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

  if (!envInfo.exists) {
    console.error(
      '[FATAL] No .env file found. Create one in the project root next to package.json.',
    );
  }

  if (!process.env.MONGODB_URI) {
    console.error(
      '[FATAL] MONGODB_URI was not loaded into process.env. Nest will fall back to localhost and fail if Mongo is not local.',
    );
  }

  const app = await NestFactory.create(AppModule);

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
  await app.listen(port);
  console.log(`[Bootstrap] API listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Failed to start:', err);
  process.exit(1);
});
