import { Module } from '@nestjs/common';
import { BlockchainStateService } from './blockchain-service';

@Module({
    providers: [BlockchainStateService],
    exports: [BlockchainStateService],
})
export class BlockchainStateModule { }