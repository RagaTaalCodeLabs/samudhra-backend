import { Module } from '@nestjs/common';
import { StudentModule } from '../student/student.module';
import { SeederService } from './seeder.service';

/**
 * Reusable seeding; import where you need {@link SeederService}. Startup hook is registered in {@link AppModule}.
 */
@Module({
  imports: [StudentModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
