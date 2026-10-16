import { Injectable, OnModuleInit } from '@nestjs/common';
import { BridgeRequest, BridgeRequestStatus } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BridgeRequestService } from 'src/modules/bridge-request/bridge-request.service';
import { BridgeTransferService } from 'src/modules/bridge-transfer/bridge-transfer.service';

@Injectable()
export class ProcessBridgeTransfersJob implements OnModuleInit {
  private isProcessing: boolean;

  constructor(
    @InjectPinoLogger(ProcessBridgeTransfersJob.name)
    private readonly logger: PinoLogger,
    private readonly bridgeRequestService: BridgeRequestService,
    private readonly bridgeTransferService: BridgeTransferService,
  ) {}

  onModuleInit(): void {
    this.isProcessing = false;
  }

  async run(): Promise<void> {
    if (this.isProcessing) {
      this.logger.info('Process requests job is already processing');
      return;
    }
    this.isProcessing = true;
    this.logger.info('Process requests job is starting');
    try {
      const requests = await this.getRequests();
      if (!requests.length) return;
      for (const request of requests) {
        try {
          await this.processRequest(request);
        } catch (error) {
          this.logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            },
            'Error in process request',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error in process requests job',
      );
    } finally {
      this.isProcessing = false;
      this.logger.info('Process requests job is finished');
    }
  }

  private async getRequests(): Promise<BridgeRequest[]> {
    const requests = await this.bridgeRequestService.findMany({
      status: BridgeRequestStatus.APPROVED,
    });
    if (!requests.length) {
      this.logger.debug('No requests found to process');
      return [];
    }
    this.logger.info(`Found ${requests.length} requests to process`);
    return requests;
  }

  private async processRequest(request: BridgeRequest): Promise<void> {
    const transfer = await this.bridgeTransferService.create({
      request: { connect: { id: request.id } },
      amount: request.amount.mul(request.exchangeRate),
    });
    this.logger.info(
      `Transfer for request ${request.id} is created with id ${transfer.id} and status ${transfer.status}`,
    );
    await this.bridgeRequestService.update(
      { id: request.id },
      { status: BridgeRequestStatus.PROCESSED },
    );
    this.logger.info(
      `Request with id ${request.id} is updated to ${BridgeRequestStatus.PROCESSED} status`,
    );
  }
}
