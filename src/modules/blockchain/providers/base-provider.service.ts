import { Injectable } from '@nestjs/common';
import { JsonRpcProvider } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BaseProviderService {
    private provider: JsonRpcProvider;

    constructor(private readonly config: ConfigService) {
        this.provider = new JsonRpcProvider(this.config.get('BASE_RPC_URL') as string);
    }

    getProvider(): JsonRpcProvider {
        return this.provider;
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }
}