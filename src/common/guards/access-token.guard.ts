import { CanActivate, ExecutionContext, ForbiddenException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { JwtService } from "src/modules/auth/jwt/jwt.service";

export class AccessTokenGuard implements CanActivate {
    constructor(
        @InjectPinoLogger(AccessTokenGuard.name) private readonly logger: PinoLogger,
        private readonly jwtService: JwtService,
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
            const { id, role } = this.jwtService.verifyAccessToken(token);
            request['user'] = { id, role };
        } catch (error) {
            this.logger.error({ error }, 'Error verifying access token');
            throw new InternalServerErrorException('Internal server error');
        }
        return true;
    }
}