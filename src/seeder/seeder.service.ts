import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StudentRepository } from '../student/student.repository';
import { generateStudents, looksLikeValidEmail } from './generators/student.generator';

export interface ReseedOptions {
  /** Clamped to 50–100 if provided; otherwise uses config default. */
  count?: number;
}

/**
 * Populates the in-memory student store. Depends only on {@link StudentRepository}, not StudentService.
 */
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly students: StudentRepository,
    private readonly config: ConfigService,
  ) {}

  /**
   * Clears all students and inserts a freshly generated set. Idempotent per call.
   */
  async resetAndReseed(options?: ReseedOptions): Promise<{ count: number }> {
    const count = this.resolveCount(options?.count);
    this.students.clear();

    const { students, stats } = generateStudents(count);
    this.students.replaceAll(students);

    const invalid = students.filter((s) => !looksLikeValidEmail(s.parentEmail)).length;

    this.logger.log(
      `Seeded ${students.length} students: paid=${stats.feePaidTrue}, unpaid=${stats.feePaidFalse}, ` +
        `lastPaidDate null=${stats.lastPaidNull}, invalid-email rows=${invalid}`,
    );

    return { count: students.length };
  }

  private resolveCount(override?: number): number {
    const fromEnv = this.config.get<number>('seeder.studentCount');
    const raw = override ?? fromEnv ?? 75;
    const n = typeof raw === 'number' && !Number.isNaN(raw) ? raw : 75;
    return Math.min(100, Math.max(50, Math.floor(n)));
  }
}
