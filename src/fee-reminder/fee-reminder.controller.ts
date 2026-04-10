import { Controller, Post } from '@nestjs/common';
import { FeeReminderService } from './fee-reminder.service';

/**
 * Allows manual execution of the same logic as the cron job (protect in production).
 */
@Controller('fee-reminders')
export class FeeReminderController {
  constructor(private readonly feeReminderService: FeeReminderService) {}

  @Post('run')
  runNow() {
    return this.feeReminderService.sendRemindersToUnpaid();
  }
}
