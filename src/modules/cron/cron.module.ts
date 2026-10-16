import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockchainStateModule } from '../blockchain-state/blockchain-state.module';
import { AssetModule } from '../asset/asset.module';
import { UserModule } from '../user/user.module';
import { BridgeRequestModule } from '../bridge-request/bridge-request.module';
import { BridgeTransferModule } from '../bridge-transfer/bridge-transfer.module';
import { SyncBlockchainEventsJob } from './jobs/sync-blockchain-events.job';
import { ProcessBridgeTransfersJob } from './jobs/process-bridge-transfers.job';
import { ExecuteBridgeTransfersJob } from './jobs/execute-bridge-transfers.job';
import { ValidateBridgeTransfersJob } from './jobs/validate-bridge-transfers.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BlockchainStateModule,
    AssetModule,
    UserModule,
    BridgeRequestModule,
    BridgeTransferModule,
  ],
  providers: [
    CronService,
    SyncBlockchainEventsJob,
    ProcessBridgeTransfersJob,
    ExecuteBridgeTransfersJob,
    ValidateBridgeTransfersJob,
  ],
})
export class CronModule {}
