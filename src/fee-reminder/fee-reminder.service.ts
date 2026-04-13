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
    const allStudents = this.students.findAll();
    this.logger.log(`[JOB] Loaded ${allStudents.length} student record(s) for reminder evaluation`);

    const selected: Student[] = [];
    let skipped = 0;
    for (const student of allStudents) {
      const skipReason = this.getSkipReason(student);
      if (skipReason) {
        skipped += 1;
        this.logger.debug(
          `[SKIP] studentId=${student.id} name="${student.name}" reason="${skipReason}"`,
        );
        continue;
      }
      selected.push(student);
      this.logger.debug(
        `[SELECT] studentId=${student.id} name="${student.name}" reason="unpaid and valid parent email"`,
      );
    }

    let succeeded = 0;
    let failed = 0;

    for (const student of selected) {
      const reminderLevel = this.getReminderLevel(student);
      this.logger.debug(
        `[LEVEL] studentId=${student.id} name="${student.name}" reminderLevel=${reminderLevel}`,
      );
      const content = this.email.generateEmailContent(student, reminderLevel);
      const result = await this.email.sendMail({
        to: student.parentEmail,
        subject: content.subject,
        text: content.text,
      });
      if (result.ok) {
        succeeded += 1;
        this.logger.log(
          `[SEND:SUCCESS] studentId=${student.id} email=${student.parentEmail} reminderLevel=${reminderLevel}`,
        );
      } else {
        failed += 1;
        this.logger.error(
          `[SEND:FAILED] studentId=${student.id} email=${student.parentEmail} reminderLevel=${reminderLevel} error="${result.error ?? 'unknown'}"`,
        );
      }
    }

    this.logger.log(
      `[JOB] Fee reminders finished: evaluated=${allStudents.length}, selected=${selected.length}, skipped=${skipped}, sent=${succeeded}, failed=${failed}`,
    );

    return { attempted: selected.length, succeeded, failed };
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

  private getSkipReason(student: Student): string | null {
    if (student.feePaid) {
      return 'fees already paid';
    }
    if (!student.parentEmail || !this.isValidEmail(student.parentEmail)) {
      return 'invalid parent email';
    }
    return null;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
