import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Query, UseFilters } from '@nestjs/common';
import { BridgeRequestService } from './bridge-request.service';
import { FindManyBridgeRequestsDto } from './dtos/find-many-bridge-requests.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Controller({ path: 'bridge-requests' })
export class BridgeRequestController {
    constructor(private readonly bridgeRequestService: BridgeRequestService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseFilters(HttpExceptionFilter)
    async findMany(@Query() query: FindManyBridgeRequestsDto) {
        return this.bridgeRequestService.findMany({
            ...(query.walletAddress && { user: { is: { walletAddress: query.walletAddress.toLowerCase() } } }),
            ...(query.status && { status: query.status }),
        });
    }
}