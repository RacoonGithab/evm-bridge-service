import { Injectable } from '@nestjs/common';
import { SyncBlockchainEventsJob } from './jobs/sync-blockchain-events.job';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessBridgeTransfersJob } from './jobs/process-bridge-transfers.job';
import { ExecuteBridgeTransfersJob } from './jobs/execute-bridge-transfers.job';
import { ValidateBridgeTransfersJob } from './jobs/validate-bridge-transfers.job';

@Injectable()
export class CronService {
  constructor(
    private readonly syncBlockchainEventsJob: SyncBlockchainEventsJob,
    private readonly processBridgeTransfersJob: ProcessBridgeTransfersJob,
    private readonly executeBridgeTransfersJob: ExecuteBridgeTransfersJob,
    private readonly validateBridgeTransfersJob: ValidateBridgeTransfersJob,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncBlockchainEvents(): Promise<void> {
    await this.syncBlockchainEventsJob.run();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processBridgeTransfers(): Promise<void> {
    await this.processBridgeTransfersJob.run();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async executeTransfers(): Promise<void> {
    await this.executeBridgeTransfersJob.run();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async validateTransfers(): Promise<void> {
    await this.validateBridgeTransfersJob.run();
  }
}
