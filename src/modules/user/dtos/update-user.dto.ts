import { UserStatus } from "@prisma/client";
import { IsEthereumAddress, IsIn } from "class-validator";

export class UpdateUserDto {
    @IsEthereumAddress({
        message: 'Invalid Ethereum wallet address format'
    })
    walletAddress: string;

    @IsIn(Object.values(UserStatus), {
        message: `Status must be one of the following values: ${Object.values(UserStatus).join(', ')}`
    })
    status: UserStatus;
}