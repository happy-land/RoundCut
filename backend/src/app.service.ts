import { MailerService } from '@nestjs-modules/mailer';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// export type SendEmailDto = {
//   sender?: string | Address;
//   recipients: Address[];
//   subject: string;
//   text: string;
//   html: string;
// };

@Injectable()
export class AppService {
  constructor(
    // private readonly mailerService: MailerService,
    // private readonly configService: ConfigService,
  ) {}

  // async sendEmail(dto: SendEmailDto) {
  //   const { recipients, subject, text, html } = dto;

  //   // const sender: string | Address = dto.sender ?? {
  //   //   name: this.configService.get<string>('APP_NAME'),
  //   //   address: this.configService.get<string>('MAIL_SENDER'),
  //   // };

  //   try {
  //     const result = await this.mailerService.sendMail({
  //       // from: sender,
  //       to: recipients,
  //       subject,
  //       text,
  //       html,
  //     });

  //     return result;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
