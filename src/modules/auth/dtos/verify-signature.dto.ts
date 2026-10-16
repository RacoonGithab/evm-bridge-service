import { IsEthereumAddress, IsString } from "class-validator";

export class VerifySignatureDto {
    @IsEthereumAddress({
        message: 'Invalid Ethereum wallet address format'
    })
    walletAddress: string;

    @IsString({
        message: 'Signature is required'
    })
    signature: string;
}