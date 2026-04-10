import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { EmailModule } from './email/email.module';
import { FeeReminderModule } from './fee-reminder/fee-reminder.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    EmailModule,
    StudentModule,
    FeeReminderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
