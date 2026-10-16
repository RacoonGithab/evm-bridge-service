import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsonRpcProvider } from 'ethers';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BscTokenDepositContract, BscTokenDepositContract__factory } from 'src/modules/blockchain/contracts/types';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import { BlockchainStateService } from 'src/modules/blockchain-state/blockchain-service';
import { Blockchain, BridgeRequestStatus, UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AssetService } from 'src/modules/asset/asset.service';
import { UserService } from 'src/modules/user/user.service';
import { BridgeRequestService } from 'src/modules/bridge-request/bridge-request.service';
import { TypedEventLog } from 'src/modules/blockchain/contracts/types/common';
import { TokensBridgedEvent } from 'src/modules/blockchain/contracts/types/BscTokenDepositContract';
import { bigIntToDecimal } from '../../../common/helpers/decimal.helper';

@Injectable()
export class SyncBlockchainEventsJob implements OnModuleInit {
  private provider: JsonRpcProvider;
  private contract: BscTokenDepositContract;
  private isProcessing: boolean;

  constructor(
    @InjectPinoLogger(SyncBlockchainEventsJob.name) private readonly logger: PinoLogger,
    private readonly blockchainService: BlockchainService,
    private readonly config: ConfigService,
    private readonly blockchainStateService: BlockchainStateService,
    private readonly assetService: AssetService,
    private readonly userService: UserService,
    private readonly bridgeRequestService: BridgeRequestService,
  ) { }

  onModuleInit(): void {
    this.provider = this.blockchainService.getProvider(Blockchain.BSC);
    this.contract = BscTokenDepositContract__factory.connect(
      this.config.get('BSC_TOKEN_DEPOSIT_CONTRACT_ADDRESS') as string,
      this.provider,
    );
    this.isProcessing = false;
  }

  async run(): Promise<void> {
    if (this.isProcessing) {
      this.logger.info('Read events job is already processing');
      return;
    }
    this.isProcessing = true;
    this.logger.info('Read events job is starting');
    try {
      const blockchainState = await this.blockchainStateService.findOne({
        blockchain: Blockchain.BSC,
      });
      const fromBlock = Number(blockchainState.processedBlockNumber) + 1;
      const toBlock = await this.blockchainService.getBlockNumber(
        Blockchain.BSC,
      );
      const events = await this.getEvents(fromBlock, toBlock);
      if (!events.length) {
        await this.blockchainStateService.update(
          { id: blockchainState.id },
          { processedBlockNumber: toBlock },
        );
        this.logger.info(
          `Processed block number for ${Blockchain.BSC} is updated to ${toBlock}`,
        );
        return;
      }
      for (const event of events) {
        try {
          await this.processEvent(event);
        } catch (error) {
          this.logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            },
            'Error in process event',
          );
        }
      }
      await this.blockchainStateService.update(
        { id: blockchainState.id },
        { processedBlockNumber: toBlock },
      );
      this.logger.info(
        `Processed block number for ${Blockchain.BSC} is updated to ${toBlock}`,
      );
    } catch (error) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error in read events job',
      );
    } finally {
      this.isProcessing = false;
      this.logger.info('Read events job is finished');
    }
  }

  private async getEvents(fromBlock: number, toBlock: number): Promise<TypedEventLog<TokensBridgedEvent.Event>[]> {
    const step = 100;
    const allEvents: TypedEventLog<TokensBridgedEvent.Event>[] = [];
    for (let start = fromBlock; start <= toBlock; start += step) {
      const end = Math.min(start + step - 1, toBlock);
      const events = await this.contract.queryFilter(
        this.contract.filters.TokensBridged(),
        start,
        end,
      );
      allEvents.push(...events);
      await new Promise((r) => setTimeout(r, 200));
    }
    if (!allEvents.length) {
      this.logger.debug(
        `No events found between blocks ${fromBlock} and ${toBlock}`,
      );
      return [];
    }
    this.logger.info(
      `Found ${allEvents.length} events between blocks ${fromBlock} and ${toBlock}`,
    );
    return allEvents;
  }

  private async processEvent(event: TypedEventLog<TokensBridgedEvent.Event>): Promise<void> {
    const { token, amount, sender, baseAddress } = event.args;
    const asset = await this.assetService.findOne({ contractAddress: token });
    const user = await this.userService.create({ walletAddress: sender.toLowerCase() });
    const request = await this.bridgeRequestService.create({
      user: { connect: { id: user.id } },
      asset: { connect: { id: asset.id } },
      amount: bigIntToDecimal(amount),
      toAddress: baseAddress,
      fromBlockchain: Blockchain.BSC,
      toBlockchain: Blockchain.BASE,
      exchangeRate: user.status === UserStatus.VERIFIED ? asset.priceInUsd : 0,
      txHash: event.transactionHash,
      status:
        user.status === UserStatus.VERIFIED
          ? BridgeRequestStatus.APPROVED
          : user.status === UserStatus.SUSPENDED
            ? BridgeRequestStatus.REJECTED
            : BridgeRequestStatus.PENDING,
    });
    this.logger.info(
      `Request for transaction hash ${event.transactionHash} is created with id ${request.id} and ${request.status} status`,
    );
  }
}
