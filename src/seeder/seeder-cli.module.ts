import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SeederModule } from './seeder.module';

/**
 * Minimal context for `npm run seed` — no HTTP, no cron, no automatic startup seed.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SeederModule,
  ],
})
export class SeederCliModule {}
