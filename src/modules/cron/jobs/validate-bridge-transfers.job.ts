import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Blockchain,
  BridgeTransfer,
  BridgeTransferStatus,
} from '@prisma/client';
import { JsonRpcProvider } from 'ethers';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import { BridgeTransferService } from 'src/modules/bridge-transfer/bridge-transfer.service';

@Injectable()
export class ValidateBridgeTransfersJob implements OnModuleInit {
  private provider: JsonRpcProvider;
  private isProcessing: boolean;

  constructor(
    @InjectPinoLogger(ValidateBridgeTransfersJob.name)
    private readonly logger: PinoLogger,
    private readonly blockchainService: BlockchainService,
    private readonly bridgeTransferService: BridgeTransferService,
  ) {}

  onModuleInit(): void {
    this.provider = this.blockchainService.getProvider(Blockchain.BASE);
    this.isProcessing = false;
  }

  async run(): Promise<void> {
    if (this.isProcessing) {
      this.logger.info('Validate transfers job is already processing');
      return;
    }
    this.isProcessing = true;
    this.logger.info('Validate transfers job is starting');
    try {
      const transfers = await this.getTransfers();
      if (!transfers.length) return;
      for (const transfer of transfers) {
        try {
          await this.validateTransfer(transfer);
        } catch (error) {
          this.logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            },
            'Error in validate transfer',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error in validate transfers job',
      );
    } finally {
      this.isProcessing = false;
      this.logger.info('Validate transfers job is finished');
    }
  }

  private async getTransfers(): Promise<BridgeTransfer[]> {
    const transfers = await this.bridgeTransferService.findMany({
      status: BridgeTransferStatus.PROCESSING,
    });
    if (!transfers.length) {
      this.logger.debug('No transfers found to validate');
      return [];
    }
    this.logger.info(`Found ${transfers.length} transfers to validate`);
    return transfers;
  }

  private async validateTransfer(transfer: BridgeTransfer): Promise<void> {
    if (!transfer.txHash) {
      this.logger.warn(
        `Transfer with id ${transfer.id} has no transaction hash`,
      );
      return;
    }
    const receipt = await this.provider.getTransactionReceipt(transfer.txHash);
    if (!receipt) {
      this.logger.warn(
        `Transaction receipt for transfer with id ${transfer.id} not found`,
      );
      return;
    }
    if (!receipt.status) {
      this.logger.warn(
        `Transaction receipt for transfer with id ${transfer.id} failed`,
      );
      await this.bridgeTransferService.update(
        { id: transfer.id },
        { status: BridgeTransferStatus.FAILED },
      );
      this.logger.warn(
        `Transfer with id ${transfer.id} is updated to ${BridgeTransferStatus.FAILED} status`,
      );
      return;
    }
    await this.bridgeTransferService.update(
      { id: transfer.id },
      { status: BridgeTransferStatus.COMPLETED },
    );
    this.logger.info(
      `Transfer with id ${transfer.id} is updated to ${BridgeTransferStatus.COMPLETED} status`,
    );
  }
}
