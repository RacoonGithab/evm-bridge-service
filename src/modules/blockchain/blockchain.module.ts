import { Global, Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BscProviderService } from './providers/bsc-provider.service';
import { BaseProviderService } from './providers/base-provider.service';

@Global()
@Module({
    providers: [BlockchainService, BscProviderService, BaseProviderService],
    exports: [BlockchainService],
})
export class BlockchainModule { }