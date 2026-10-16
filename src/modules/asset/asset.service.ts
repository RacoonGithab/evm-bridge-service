import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Asset, Prisma } from '@prisma/client';

@Injectable()
export class AssetService {
    constructor(private readonly prisma: PrismaService) { }

    async findOne(where: Prisma.AssetWhereUniqueInput): Promise<Asset> {
        const asset = await this.prisma.asset.findUnique({
            where,
        });
        if (!asset) {
            throw new NotFoundException(`Asset with contract address ${where.contractAddress} not found`);
        }
        return asset;
    }
}