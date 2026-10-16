import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockchainState, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class BlockchainStateService {
    constructor(private readonly prisma: PrismaService) { }

    async findOne(where: Prisma.BlockchainStateWhereUniqueInput): Promise<BlockchainState> {
        const blockchainState = await this.prisma.blockchainState.findUnique({
            where,
        });
        if (!blockchainState) {
            throw new NotFoundException('Blockchain state not found');
        }
        return blockchainState;
    }

    async update(where: Prisma.BlockchainStateWhereUniqueInput, data: Prisma.BlockchainStateUpdateInput): Promise<BlockchainState> {
        const blockchainState = await this.prisma.blockchainState.findUnique({ where });
        if (!blockchainState) {
            throw new NotFoundException('Blockchain state not found');
        }
        return this.prisma.blockchainState.update({ where, data });
    }
}