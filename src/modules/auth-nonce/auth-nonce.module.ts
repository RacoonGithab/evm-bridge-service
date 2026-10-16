import { Module } from '@nestjs/common';
import { AuthNonceService } from './auth-nonce.service';

@Module({
    providers: [AuthNonceService],
    exports: [AuthNonceService],
})
export class AuthNonceModule { }