import { Catch, ExceptionFilter, ArgumentsHost, HttpException, NotFoundException, HttpStatus, BadRequestException, UnauthorizedException, ConflictException, ForbiddenException } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        if (exception instanceof NotFoundException) {
            response.status(exception.getStatus()).json({
                message: exception.message,
            });
            return;
        }
        if (exception instanceof BadRequestException) {
            const exceptionResponse = exception.getResponse();
            const message = typeof exceptionResponse === 'object'
                ? (exceptionResponse as any).message
                : exception.message;
            response.status(exception.getStatus()).json({
                message,
            });
            return;
        }
        if (exception instanceof ConflictException) {
            response.status(exception.getStatus()).json({
                message: exception.message,
            });
            return;
        }
        if (exception instanceof UnauthorizedException) {
            response.status(exception.getStatus()).json({
                message: exception.message,
            });
            return;
        }
        if (exception instanceof ForbiddenException) {
            response.status(exception.getStatus()).json({
                message: exception.message,
            });
            return;
        }
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
        return;
    }
}