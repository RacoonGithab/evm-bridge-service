import { BridgeRequestStatus } from "@prisma/client";
import { IsEnum, IsEthereumAddress, IsOptional } from "class-validator";

export class FindManyBridgeRequestsDto {
    @IsOptional()
    @IsEthereumAddress({
        message: 'Invalid Ethereum wallet address format'
    })
    walletAddress?: string;

    @IsOptional()
    @IsEnum(BridgeRequestStatus, {
        message: `Status must be one of the following values: ${Object.values(BridgeRequestStatus).join(', ')}`
    })
    status?: BridgeRequestStatus;
}