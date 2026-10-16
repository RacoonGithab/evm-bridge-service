import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.upsert({
      where: { walletAddress: data.walletAddress },
      create: data,
      update: {},
    });
  }

  async update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where,
      data,
    });
  }
}
