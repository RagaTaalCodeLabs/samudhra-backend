import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { EmailModule } from './email/email.module';
import { FeeReminderModule } from './fee-reminder/fee-reminder.module';
import { SeederModule } from './seeder/seeder.module';
import { SeederStartupHook } from './seeder/seeder-startup.hook';
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
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederStartupHook],
})
export class AppModule {}
