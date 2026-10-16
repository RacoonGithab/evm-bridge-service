import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JsonRpcProvider, Wallet } from 'ethers';
import {
  BaseTokenContract,
  BaseTokenContract__factory,
} from 'src/modules/blockchain/contracts/types';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import {
  Blockchain,
  BridgeRequest,
  BridgeTransfer,
  BridgeTransferStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { BridgeTransferService } from 'src/modules/bridge-transfer/bridge-transfer.service';
import { Decimal } from '@prisma/client/runtime/library';
import { decimalToBigInt } from '../../../common/helpers/decimal.helper';

@Injectable()
export class ExecuteBridgeTransfersJob implements OnModuleInit {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: BaseTokenContract;
  private isProcessing: boolean;

  constructor(
    @InjectPinoLogger(ExecuteBridgeTransfersJob.name)
    private readonly logger: PinoLogger,
    private readonly blockchainService: BlockchainService,
    private readonly config: ConfigService,
    private readonly bridgeTransferService: BridgeTransferService,
  ) { }

  onModuleInit(): void {
    this.provider = this.blockchainService.getProvider(Blockchain.BASE);
    this.wallet = new Wallet(
      this.config.get('BASE_TOKEN_OWNER_WALLET_PRIVATE_KEY') as string,
      this.provider,
    );
    this.contract = BaseTokenContract__factory.connect(
      this.config.get('BASE_TOKEN_CONTRACT_ADDRESS') as string,
      this.wallet,
    );
    this.isProcessing = false;
  }

  async run(): Promise<void> {
    if (this.isProcessing) {
      this.logger.info('Execute transfers job is already processing');
      return;
    }
    this.isProcessing = true;
    this.logger.info('Execute transfers job is starting');
    try {
      const transfers = await this.getTransfers();
      if (!transfers.length) return;
      const totalAmount = decimalToBigInt(
        transfers
          .reduce((acc, transfer) => acc.add(transfer.amount), new Decimal(0)),
      );
      const balance = await this.contract.balanceOf(this.wallet.address);
      if (totalAmount > balance) {
        await this.mintAssets(totalAmount - balance);
      }
      for (const transfer of transfers) {
        try {
          await this.executeTransfer(transfer);
        } catch (error) {
          this.logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            },
            'Error in execute transfer',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error in execute transfers job',
      );
    } finally {
      this.isProcessing = false;
      this.logger.info('Execute transfers job is finished');
    }
  }

  private async mintAssets(amount: bigint) {
    const tx = await this.contract.mint(this.wallet.address, amount);
    const receipt = await tx.wait();
    if (!receipt) {
      this.logger.warn(
        `Mint assets transaction with amount ${amount.toString()} failed`,
      );
      throw new Error('Mint assets transaction failed');
    }
    if (!receipt.status) {
      this.logger.warn(
        `Mint assets transaction with amount ${amount.toString()} failed`,
      );
      throw new Error('Mint assets transaction failed');
    }
    this.logger.info(
      `Mint assets transaction with amount ${amount.toString()} is successful`,
    );
  }

  private async getTransfers(): Promise<
    (BridgeTransfer & { request: BridgeRequest })[]
  > {
    const transfers = await this.bridgeTransferService.findMany({
      status: BridgeTransferStatus.PENDING,
    });
    if (!transfers.length) {
      this.logger.debug('No transfers found to execute');
      return [];
    }
    this.logger.info(`Found ${transfers.length} transfers to execute`);
    return transfers;
  }

  private async executeTransfer(
    transfer: BridgeTransfer & { request: BridgeRequest },
  ): Promise<void> {
    const tx = await this.contract.transfer(
      transfer.request.toAddress,
      decimalToBigInt(transfer.amount),
    );
    await this.bridgeTransferService.update(
      { id: transfer.id },
      { status: BridgeTransferStatus.PROCESSING, txHash: tx.hash },
    );
    this.logger.info(
      `Transfer with id ${transfer.id} is executed with transaction hash ${tx.hash}`,
    );
  }
}
