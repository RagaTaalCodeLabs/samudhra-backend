/**
 * Run: npm run seed
 * Optional: SEED_STUDENT_COUNT=80 (clamped 50–100)
 */
import { NestFactory } from '@nestjs/core';
import { SeederCliModule } from './seeder-cli.module';
import { SeederService } from './seeder.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeederCliModule, {
    logger: ['log', 'error', 'warn'],
  });
  try {
    const seeder = app.get(SeederService);
    const envCount = process.env.SEED_STUDENT_COUNT;
    const count = envCount !== undefined ? parseInt(envCount, 10) : undefined;
    await seeder.resetAndReseed(Number.isFinite(count) ? { count } : undefined);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
