import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserRole } from "@prisma/client";

export const User = createParamDecorator((data: keyof Readonly<{ id: string, role: UserRole }>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return data ? request['user'][data] : request['user'];
});