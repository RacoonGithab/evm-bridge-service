import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {

    constructor(private readonly config: ConfigService) { }

    generateAccessToken(payload: Readonly<{ id: string, role: string }>): string {
        const secretKey = this.config.get('JWT_ACCESS_TOKEN_SECRET_KEY') as string;
        const expiresIn = this.config.get('JWT_ACCESS_TOKEN_TTL') as string;
        const options: SignOptions = {
            expiresIn: parseInt(expiresIn, 10),
        };
        return jwt.sign(payload, secretKey, options);
    }

    generateRefreshToken(payload: Readonly<{ id: string }>): string {
        const secretKey = this.config.get('JWT_REFRESH_TOKEN_SECRET_KEY') as string;
        const expiresIn = this.config.get('JWT_REFRESH_TOKEN_TTL') as string;
        const options: SignOptions = {
            expiresIn: parseInt(expiresIn, 10),
        };
        return jwt.sign(payload, secretKey, options);
    }

    verifyAccessToken(token: string): Readonly<{ id: string, role: string }> {
        const secretKey = this.config.get('JWT_ACCESS_TOKEN_SECRET_KEY') as string;
        const options: VerifyOptions = {
            algorithms: ['HS256'],
        };
        return jwt.verify(token, secretKey, options) as Readonly<{ id: string, role: string }>;
    }

    verifyRefreshToken(token: string): Readonly<{ id: string }> {
        const secretKey = this.config.get('JWT_REFRESH_TOKEN_SECRET_KEY') as string;
        const options: VerifyOptions = {
            algorithms: ['HS256'],
        };
        return jwt.verify(token, secretKey, options) as Readonly<{ id: string }>;
    }
}