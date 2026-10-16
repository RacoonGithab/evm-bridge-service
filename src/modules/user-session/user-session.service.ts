import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UserSession, Prisma } from '@prisma/client';

@Injectable()
export class UserSessionService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.UserSessionCreateInput): Promise<UserSession> {
        return this.prisma.userSession.create({ data });
    }
}