import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestMessageDto } from './dtos/request-message.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { VerifySignatureDto } from './dtos/verify-signature.dto';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@Controller({ path: 'auth' })
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('request-message')
    @HttpCode(HttpStatus.CREATED)
    @UseFilters(HttpExceptionFilter)
    async requestMessage(@Body() body: RequestMessageDto): Promise<Readonly<{ message: string }>> {
        return this.authService.requestMessage(body.walletAddress);
    }

    @Post('verify-signature')
    @HttpCode(HttpStatus.CREATED)
    @UseFilters(HttpExceptionFilter)
    async verifySignature(@Body() body: VerifySignatureDto): Promise<Readonly<{ accessToken: string, refreshToken: string }>> {
        return this.authService.verifySignature(body.walletAddress, body.signature);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RefreshTokenGuard)
    @UseFilters(HttpExceptionFilter)
    async refresh(@User('id') id: string, @User('role') role: UserRole): Promise<Readonly<{ accessToken: string, refreshToken: string }>> {
        return this.authService.refreshAccessToken(id, role);
    }
}