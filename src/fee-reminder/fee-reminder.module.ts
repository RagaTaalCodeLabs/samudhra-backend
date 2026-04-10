import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { StudentModule } from '../student/student.module';
import { FeeReminderController } from './fee-reminder.controller';
import { FeeReminderService } from './fee-reminder.service';

@Module({
  imports: [StudentModule, EmailModule],
  controllers: [FeeReminderController],
  providers: [FeeReminderService],
})
export class FeeReminderModule {}
