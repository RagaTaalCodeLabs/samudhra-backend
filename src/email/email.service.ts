import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends mail via Gmail SMTP using an app password (not the account login password).
 * Verifies transport on startup when credentials are present.
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const user = this.config.get<string>('gmail.user');
    const pass = this.config.get<string>('gmail.appPassword');
    const dryRun = this.config.get<boolean>('feeReminder.dryRun');

    if (dryRun) {
      this.logger.warn('FEE_REMINDER_DRY_RUN=true — emails will be logged, not sent.');
      return;
    }

    if (!user || !pass) {
      this.logger.warn(
        'GMAIL_USER or GMAIL_APP_PASSWORD missing — email sending is disabled until configured.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    try {
      await this.transporter.verify();
      this.logger.log('Gmail SMTP transport verified.');
    } catch (err) {
      this.logger.error('Gmail SMTP verification failed', err instanceof Error ? err.stack : err);
      this.transporter = null;
    }
  }

  /**
   * Sends a plain-text email. Swallows per-recipient errors when used from batch flows;
   * callers can catch or rely on returned success flag.
   */
  async sendMail(options: SendMailOptions): Promise<{ ok: boolean; error?: string }> {
    const dryRun = this.config.get<boolean>('feeReminder.dryRun');

    if (dryRun) {
      this.logger.log(
        `[dry-run] To: ${options.to} | Subject: ${options.subject}\n${options.text}`,
      );
      return { ok: true };
    }

    if (!this.transporter) {
      const msg = 'Email transport not configured or verification failed';
      this.logger.warn(`${msg}; skipping send to ${options.to}`);
      return { ok: false, error: msg };
    }

    const from = this.config.get<string>('gmail.user') ?? '';

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}`);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email to ${options.to}: ${message}`);
      return { ok: false, error: message };
    }
  }
}
