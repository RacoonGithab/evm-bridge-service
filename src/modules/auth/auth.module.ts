import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AuthNonceModule } from '../auth-nonce/auth-nonce.module';
import { UserSessionModule } from '../user-session/user-session.module';
import { JwtService } from './jwt/jwt.service';

@Module({
    imports: [UserModule, AuthNonceModule, UserSessionModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService],
})
export class AuthModule { }