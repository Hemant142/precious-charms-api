import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressModule } from './address/address.module';
import { logMongoConnectionDiagnostics, maskMongoUri } from './config/env';

const envFilePath = resolve(process.cwd(), '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      cache: false,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('MongoConfig');
        const fromConfig = config.get<string>('MONGODB_URI');
        const fromProcess = process.env.MONGODB_URI;
        const uri = fromConfig || fromProcess;

        logger.log(`ConfigService MONGODB_URI: ${maskMongoUri(fromConfig)}`);
        logger.log(`process.env MONGODB_URI: ${maskMongoUri(fromProcess)}`);
        logger.log(`Resolved URI used for connect: ${maskMongoUri(uri)}`);
        logger.log(`envFilePath: ${envFilePath}`);

        logMongoConnectionDiagnostics(uri);

        if (!uri) {
          throw new Error(
            `MONGODB_URI is missing. Expected it in ${envFilePath}. ` +
              `Without it, the app cannot connect to MongoDB Atlas.`,
          );
        }

        // Antivirus / corporate SSL inspection often breaks Atlas TLS with
        // UNABLE_TO_VERIFY_LEAF_SIGNATURE. Atlas then reports a generic
        // "IP whitelist" message even when the real cause is certificate trust.
        const allowInvalidTls =
          config.get<string>('MONGO_TLS_ALLOW_INVALID') === 'true' ||
          process.env.MONGO_TLS_ALLOW_INVALID === 'true';

        if (allowInvalidTls) {
          logger.warn(
            'MONGO_TLS_ALLOW_INVALID=true — TLS certificate verification is disabled (local/dev only).',
          );
        }

        return {
          uri,
          serverSelectionTimeoutMS: 15000,
          tls: true,
          tlsAllowInvalidCertificates: allowInvalidTls,
          connectionFactory: (connection: {
            on: (event: string, cb: (...args: any[]) => void) => void;
            readyState: number;
          }) => {
            connection.on('connected', () => {
              logger.log('MongoDB connected successfully');
            });
            connection.on('error', (err: Error) => {
              logger.error(`MongoDB connection error: ${err.message}`);
              if (/UNABLE_TO_VERIFY|certificate/i.test(err.message)) {
                logger.error(
                  'Root cause: TLS certificate verification failed (often antivirus SSL scanning). Set MONGO_TLS_ALLOW_INVALID=true in .env for local development.',
                );
              } else if (/whitelist|IP/i.test(err.message)) {
                logger.error(
                  'Possible Atlas Network Access block. Also check TLS errors above — whitelist messages can be misleading.',
                );
              }
            });
            return connection;
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
