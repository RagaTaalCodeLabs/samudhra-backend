import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';

/**
 * In-memory persistence. Populate via {@link SeederService}, CLI, or future migrations.
 */
@Injectable()
export class StudentRepository {
  private readonly students: Map<string, Student> = new Map();

  /** Remove all rows (used before reseed). */
  clear(): void {
    this.students.clear();
  }

  /** Replace the entire store atomically from the given list. */
  replaceAll(rows: Student[]): void {
    this.clear();
    for (const s of rows) {
      this.students.set(s.id, s);
    }
  }

  findAll(): Student[] {
    return [...this.students.values()];
  }

  findUnpaid(): Student[] {
    return this.findAll().filter((s) => !s.feePaid);
  }

  findById(id: string): Student | undefined {
    return this.students.get(id);
  }
}
