import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import Mail from 'nodemailer/lib/mailer';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  mailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });

    return transporter;
  }

  template(html: string, replacements: Record<string, string>) {
    return html.replace(
      /%(\w*)%/g, // or /{(\w*)}/g for "{this} instead of %this%"
      function (m, key) {
        return replacements.hasOwnProperty(key) ? replacements[key] : '';
      },
    );
  }

  async sendEmail(dto: SendEmailDto) {
    const { from, recipients, subject } = dto;
    const html = dto.placeholderReplacements
      ? this.template(dto.html, dto.placeholderReplacements)
      : dto.html;

    const transport = this.mailTransport();

    const options: Mail.Options = {
      from: from ?? {
        name: this.configService.get<string>('APP_NAME'),
        address: this.configService.get<string>('DEFAULT_MAIL_FROM'),
      },
      to: recipients,
      subject,
      html,
    };

    try {
      const result = await transport.sendMail(options);
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async sendResetPasswordLink(email: string, token: string) {
    // const user = await this.usersService.findByEmail(email);
    //user.resetToken = token;  - что это???

    const url = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    const dto: SendEmailDto = {
      recipients: [{ name: 'Ruslan', address: email }],
      subject: 'Сброс пароля',
      html: `<p>Для сброса пароля перейдите по <a href="${url}">ссылке</a></p>`,
      // placeholderReplacements: body,
    };

    return this.sendEmail(dto);
  }

  async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException('Неверный токен');
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Токен просрочен');
      }
      throw new BadRequestException('Неверный токен');
    }
  }
}
