import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';

/**
 * Runs {@link SeederService.resetAndReseed} when `SEED_ON_STARTUP=true`.
 * Registered only in {@link AppModule} so CLI/bootstrap contexts do not double-seed.
 */
@Injectable()
export class SeederStartupHook implements OnModuleInit {
  private readonly logger = new Logger(SeederStartupHook.name);

  constructor(
    private readonly config: ConfigService,
    private readonly seeder: SeederService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.config.get<boolean>('seeder.runOnStartup')) {
      return;
    }
    this.logger.log('SEED_ON_STARTUP enabled — resetting and seeding students…');
    await this.seeder.resetAndReseed();
  }
}
