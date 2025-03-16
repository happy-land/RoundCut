import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send-email')
  async sendMail(@Body() body: Record<string, string>) {
    const dto: SendEmailDto = {
      // from: { name: 'Lucy', address: 'lucye@xample.com' },
      recipients: [{ name: 'Ruslan', address: 'ruslan.s.kulish@gmail.com' }],
      subject: 'Письмо от CustomCut',
      html: '<p>Привет, <strong>%name%</strong>, ваш номер %number% </p>',
      placeholderReplacements: body,
    };

    return await this.mailerService.sendEmail(dto);
  }
}
