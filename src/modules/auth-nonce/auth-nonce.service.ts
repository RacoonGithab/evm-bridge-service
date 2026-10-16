import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AuthNonce, Prisma } from '@prisma/client';

@Injectable()
export class AuthNonceService {
    constructor(private readonly prisma: PrismaService) { }

    async findOne(where: Prisma.AuthNonceWhereUniqueInput): Promise<AuthNonce> {
        const nonce = await this.prisma.authNonce.findUnique({ where });
        if (!nonce) {
            throw new NotFoundException('Nonce not found');
        }
        return nonce;
    }

    async findFirst(where: Prisma.AuthNonceWhereInput): Promise<AuthNonce> {
        const nonce = await this.prisma.authNonce.findFirst({ where, orderBy: { createdAt: 'desc' } });
        if (!nonce) {
            throw new NotFoundException('Nonce not found');
        }
        return nonce;
    }

    async create(data: Prisma.AuthNonceCreateInput): Promise<AuthNonce> {
        return this.prisma.authNonce.create({ data });
    }
}