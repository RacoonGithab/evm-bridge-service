import { Module } from '@nestjs/common';
import { BridgeRequestController } from './bridge-request.controller';
import { BridgeRequestService } from './bridge-request.service';

@Module({
    controllers: [BridgeRequestController],
    providers: [BridgeRequestService],
    exports: [BridgeRequestService],
})
export class BridgeRequestModule { }