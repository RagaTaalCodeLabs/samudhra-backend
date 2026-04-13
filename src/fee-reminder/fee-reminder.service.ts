import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { ReminderLevel } from '../email/templates/fee-reminder.template';
import { Student } from '../student/entities/student.entity';
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
      const reminderLevel = this.getReminderLevel(student);
      const content = this.email.generateEmailContent(student, reminderLevel);
      const result = await this.email.sendMail({
        to: student.parentEmail,
        subject: content.subject,
        text: content.text,
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

  private getReminderLevel(student: Student): ReminderLevel {
    if (!student.lastPaidDate) {
      return 'HIGH';
    }

    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const overdueDays = Math.floor((Date.now() - student.lastPaidDate.getTime()) / MS_IN_DAY);

    if (overdueDays >= 90) {
      return 'HIGH';
    }
    if (overdueDays >= 45) {
      return 'MEDIUM';
    }
    return 'LOW';
  }
}
