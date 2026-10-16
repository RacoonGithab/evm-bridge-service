import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AuthNonceService } from '../auth-nonce/auth-nonce.service';
import { ethers } from 'ethers';
import { JwtService } from './jwt/jwt.service';
import { UserSessionService } from '../user-session/user-session.service';
import { UserService } from '../user/user.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {

    constructor(
        @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
        private readonly userService: UserService,
        private readonly authNonceService: AuthNonceService,
        private readonly jwtService: JwtService,
        private readonly userSessionService: UserSessionService
    ) { }

    async requestMessage(walletAddress: string): Promise<Readonly<{ message: string }>> {
        const user = await this.userService.findOne({ walletAddress });
        if (user.role !== UserRole.ADMIN) {
            this.logger.warn(`User is not an admin`);
            throw new ForbiddenException('User is not an admin');
        }
        const nonce = await this.authNonceService.create({ userId: user.id });
        const message = `Please sign this message to confirm your wallet ownership. Nonce: ${nonce.nonce}`;
        return { message };
    }

    async verifySignature(walletAddress: string, signature: string) {
        const user = await this.userService.findOne({ walletAddress });
        if (user.role !== UserRole.ADMIN) {
            this.logger.warn(`User is not an admin`);
            throw new ForbiddenException('User is not an admin');
        }
        const nonce = await this.authNonceService.findFirst({ userId: user.id });
        const message = `Please sign this message to confirm your wallet ownership. Nonce: ${nonce.nonce}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            this.logger.warn('Invalid signature');
            throw new ForbiddenException('Invalid signature');
        }
        const accessToken = this.jwtService.generateAccessToken({ id: user.id, role: UserRole.ADMIN });
        console.log(accessToken);
        const refreshToken = this.jwtService.generateRefreshToken({ id: user.id });
        await this.userSessionService.create({ user: { connect: { id: user.id } }, accessToken, refreshToken });
        return { accessToken, refreshToken };
    }

    async refreshAccessToken(id: string, role: UserRole): Promise<Readonly<{ accessToken: string, refreshToken: string }>> {
        const accessToken = this.jwtService.generateAccessToken({ id, role });
        const refreshToken = this.jwtService.generateRefreshToken({ id });
        await this.userSessionService.create({ user: { connect: { id } }, accessToken, refreshToken });
        return { accessToken, refreshToken };
    }
}