import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AssetModule } from './modules/asset/asset.module';
import { UserModule } from './modules/user/user.module';
import { BlockchainStateModule } from './modules/blockchain-state/blockchain-state.module';
import { BridgeRequestModule } from './modules/bridge-request/bridge-request.module';
import { BridgeTransferModule } from './modules/bridge-transfer/bridge-transfer.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { CronModule } from './modules/cron/cron.module';
import { UserSessionModule } from './modules/user-session/user-session.module';
import { AuthNonceModule } from './modules/auth-nonce/auth-nonce.module';
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().port().required(),
        LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
      }),
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL') as string,
        }
      }),
    }),
    PrismaModule,
    HealthModule,
    AssetModule,
    UserModule,
    AuthNonceModule,
    AuthModule,
    UserSessionModule,
    BlockchainStateModule,
    BridgeRequestModule,
    BridgeTransferModule,
    BlockchainModule,
    CronModule,
  ],
})
export class AppModule { }