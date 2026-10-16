import { CanActivate, ExecutionContext, HttpException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JwtService } from 'src/modules/auth/jwt/jwt.service';
import { UserService } from 'src/modules/user/user.service';

export class RefreshTokenGuard implements CanActivate {
    constructor(
        @InjectPinoLogger(RefreshTokenGuard.name) private readonly logger: PinoLogger,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            this.logger.warn('Authorization header is required');
            throw new UnauthorizedException('Authorization header is required');
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            this.logger.warn('Invalid authorization header format');
            throw new UnauthorizedException('Invalid authorization header format');
        }
        try {
            const { id } = this.jwtService.verifyRefreshToken(token);
            const { role } = await this.userService.findOne({ id });
            request['user'] = { id, role };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (error instanceof JsonWebTokenError) {
                this.logger.warn('Invalid refresh token');
                throw new UnauthorizedException('Invalid refresh token');
            }
            this.logger.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            }, 'Internal server error');
        }
        return true;
    }
}