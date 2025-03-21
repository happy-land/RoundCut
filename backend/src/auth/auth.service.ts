import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { HashService } from 'src/hash/hash.service';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private hashService: HashService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(email: string, password: string) {
    const usrPswd = password;
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isValidHash = await this.hashService.verifyHash(
        usrPswd,
        user.password,
      );
      return isValidHash ? user : null;
    }
    return null;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    console.log(user);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<string>(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    await this.mailerService.sendResetPasswordLink(email, token);
    return { message: 'Ссылка для сброса пароля отправлена на почту' };
  }

  async resetPassword(token: string, password: string) {
    const email = await this.mailerService.decodeConfirmationToken(token);
    // return password;
    const user = await this.usersService.findByEmail(email);
    console.log(user);
    if (!user) {
      throw new NotFoundException(
        `resetPassword() Пользователь не найден c таким email ${email}`,
      );
    }
    const hash = await this.hashService.hash(password);
    user.password = hash;
    await this.usersRepository.save(user);
    return user;
  }
}
