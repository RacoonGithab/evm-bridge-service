import { IsEthereumAddress } from "class-validator";

export class RequestMessageDto {
    @IsEthereumAddress({
        message: 'Invalid Ethereum wallet address format'
    })
    walletAddress: string;
}