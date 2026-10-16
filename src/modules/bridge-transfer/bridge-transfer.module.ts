import { Module } from '@nestjs/common';
import { BridgeTransferService } from './bridge-transfer.service';

@Module({
    providers: [BridgeTransferService],
    exports: [BridgeTransferService],
})
export class BridgeTransferModule { }