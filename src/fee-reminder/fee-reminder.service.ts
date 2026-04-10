import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import {
  buildFeeReminderText,
  FEE_REMINDER_SUBJECT,
} from '../email/templates/fee-reminder.template';
import { StudentService } from '../student/student.service';

/**
 * Orchestrates monthly fee reminders: selects unpaid students and sends one email per parent.
 */
@Injectable()
export class FeeReminderService {
  private readonly logger = new Logger(FeeReminderService.name);

  constructor(
    private readonly students: StudentService,
    private readonly email: EmailService,
  ) {}

  /**
   * Runs at 00:00 (server local time) on the 4th of every month.
   * Cron: second minute hour day-of-month month day-of-week
   */
  @Cron('0 0 4 * *', { name: 'fee-reminder-monthly' })
  async handleMonthlyFeeReminder(): Promise<void> {
    this.logger.log('Starting monthly fee reminder job');
    await this.sendRemindersToUnpaid();
  }

  /**
   * Manual trigger for tests or ops (e.g. POST /fee-reminders/run).
   */
  async sendRemindersToUnpaid(): Promise<{
    attempted: number;
    succeeded: number;
    failed: number;
  }> {
    const unpaid = this.students.findWithUnpaidFees();
    let succeeded = 0;
    let failed = 0;

    for (const student of unpaid) {
      const text = buildFeeReminderText({ studentName: student.name });
      const result = await this.email.sendMail({
        to: student.parentEmail,
        subject: FEE_REMINDER_SUBJECT,
        text,
      });
      if (result.ok) {
        succeeded += 1;
      } else {
        failed += 1;
      }
    }

    this.logger.log(
      `Fee reminders finished: ${unpaid.length} unpaid student(s), ${succeeded} sent, ${failed} failed`,
    );

    return { attempted: unpaid.length, succeeded, failed };
  }
}
