import { mailerService } from './mailer-service';
import { PATH_URL } from '../utils/consts';

class EmailService {
  async sendRegisterEmail(to: string, confirmationCode: string) {
    const link = `https://exspress-server-l2.vercel.app/${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION_CONFIRMATION}?code=${confirmationCode}`;
    const subject = 'Confirm your email address';
    const text = `Please confirm your email address by clicking the following link: link`;
    const html = `<p>Please confirm your email address by clicking the link below:</p><p><a href="${link}">Confirm Email</a></p>`;

    await mailerService.sendMail(to, subject, text, html);
  }
}

export const emailService = new EmailService();
