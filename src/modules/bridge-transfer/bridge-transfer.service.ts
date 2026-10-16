import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BridgeRequest, BridgeTransfer, Prisma } from '@prisma/client';

@Injectable()
export class BridgeTransferService {
    constructor(private readonly prisma: PrismaService) { }

    async findMany(where: Prisma.BridgeTransferWhereInput): Promise<(BridgeTransfer & { request: BridgeRequest })[]> {
        return this.prisma.bridgeTransfer.findMany({ where, include: { request: true } });
    }

    async create(data: Prisma.BridgeTransferCreateInput): Promise<BridgeTransfer> {
        const transfer = await this.prisma.bridgeTransfer.findUnique({ where: { requestId: data.request?.connect?.id } });
        if (transfer) {
            throw new ConflictException(`Transfer for request ${data.request?.connect?.id} already exists`);
        }
        return this.prisma.bridgeTransfer.create({ data });
    }

    async update(where: Prisma.BridgeTransferWhereUniqueInput, data: Prisma.BridgeTransferUpdateInput): Promise<BridgeTransfer> {
        const transfer = await this.prisma.bridgeTransfer.findUnique({ where });
        if (!transfer) {
            throw new NotFoundException(`Transfer for request ${where.requestId} not found`);
        }
        return this.prisma.bridgeTransfer.update({ where, data });
    }
}