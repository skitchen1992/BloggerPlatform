import nodemailer from 'nodemailer';
import { SETTINGS } from '../utils/settings';

export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: SETTINGS.EMAIL_USER,
        pass: SETTINGS.EMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    const mailOptions = {
      from: `"Nikita" <${SETTINGS.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          resolve();
        }
      });
    });
  }
}

export const mailerService = new MailerService();
