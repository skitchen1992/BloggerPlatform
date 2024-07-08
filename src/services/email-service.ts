import { PATH_URL } from '../utils/consts';
import { MailerService } from './mailer-service';

export class EmailService {
  constructor(protected mailerService: MailerService) {
  }
  async sendRegisterEmail(to: string, confirmationCode: string) {
    const link = `https://blogger-platform-bay.vercel.app/${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION_CONFIRMATION}?code=${confirmationCode}`;
    const subject = 'Confirm your email address';
    const text = `Please confirm your email address by clicking the following link: link`;
    const html = `<p>Please confirm your email address by clicking the link below:</p><p><a href="${link}">Confirm Email</a></p>`;

    await this.mailerService.sendMail(to, subject, text, html);
  }

  async sendRecoveryPassEmail(to: string, confirmationCode: string) {
    const link = `https://blogger-platform-bay.vercel.app/${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.PASSWORD_RECOVERY}?recoveryCode=${confirmationCode}`;
    const subject = 'Password recovery';
    const text = `To finish password recovery please follow the link below: link`;
    const html = `<p>To finish password recovery please follow the link below:</p><p><a href="${link}">Password recovery</a></p>`;

    await this.mailerService.sendMail(to, subject, text, html);
  }
}
