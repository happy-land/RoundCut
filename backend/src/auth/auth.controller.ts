import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LocalGuard } from './guards/local-auth.guard';
import { RequestUser } from 'src/utils/types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ForgotPasswordDto } from 'src/users/dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // @UseGuards(LocalGuard)
  // @Post('signin')
  // signin(@Req() req: RequestUser) {
  //   console.log(req.user);
  //   return this.authService.auth(req.user);
  // }

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req: RequestUser) {
    console.log(req);
    return this.authService.auth(req.user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const user = await this.usersService.create(createUserDto);
    this.authService.auth(user);
    delete user.password;
    return user;
  }

  @Post('forgot')
  forgot(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return forgotPasswordDto;
  }
}
