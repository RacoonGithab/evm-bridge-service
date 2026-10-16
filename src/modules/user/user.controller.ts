import { Body, Controller, HttpCode, HttpStatus, Patch, UseFilters } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from '@prisma/client';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Controller({ path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  async update(@Body() body: UpdateUserDto): Promise<User> {
    console.log(body.walletAddress);
    console.log(body.status);
    return this.userService.update({ walletAddress: body.walletAddress }, { status: body.status });
  }
}
