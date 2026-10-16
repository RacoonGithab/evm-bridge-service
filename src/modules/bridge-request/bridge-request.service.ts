import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BridgeRequest, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class BridgeRequestService {
    constructor(private readonly prisma: PrismaService) { }

    async findMany(where: Prisma.BridgeRequestWhereInput): Promise<BridgeRequest[]> {
        return this.prisma.bridgeRequest.findMany({ where, include: { user: true, asset: true, transfer: true } });
    }

    async create(data: Prisma.BridgeRequestCreateInput): Promise<BridgeRequest> {
        const request = await this.prisma.bridgeRequest.findUnique({
            where: {
                txHash: data.txHash,
            },
        });
        if (request) {
            throw new ConflictException('Request already exists');
        }
        return this.prisma.bridgeRequest.create({ data });
    }

    async update(where: Prisma.BridgeRequestWhereUniqueInput, data: Prisma.BridgeRequestUpdateInput): Promise<BridgeRequest> {
        const request = await this.prisma.bridgeRequest.findUnique({ where });
        if (!request) {
            throw new NotFoundException('Request not found');
        }
        return this.prisma.bridgeRequest.update({ where, data });
    }
}