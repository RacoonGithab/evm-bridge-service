import { Injectable } from '@nestjs/common';
import { BscProviderService } from './providers/bsc-provider.service';
import { BaseProviderService } from './providers/base-provider.service';
import { Blockchain } from '@prisma/client';
import { JsonRpcProvider } from 'ethers';

@Injectable()
export class BlockchainService {
    constructor(
        private readonly bscProviderService: BscProviderService,
        private readonly baseProviderService: BaseProviderService,
    ) { }

    getProvider(blockchain: Blockchain): JsonRpcProvider {
        switch (blockchain) {
            case Blockchain.BSC:
                return this.bscProviderService.getProvider();
            case Blockchain.BASE:
                return this.baseProviderService.getProvider();
        }
    }

    async getBlockNumber(blockchain: Blockchain): Promise<number> {
        switch (blockchain) {
            case Blockchain.BSC:
                return await this.bscProviderService.getBlockNumber();
            case Blockchain.BASE:
                return await this.baseProviderService.getBlockNumber();
        }
    }
}