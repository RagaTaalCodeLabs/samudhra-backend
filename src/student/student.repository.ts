import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';

/**
 * In-memory persistence with seed data. Replace with TypeORM/Prisma later.
 */
@Injectable()
export class StudentRepository {
  private readonly students: Map<string, Student> = new Map();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const rows: Student[] = [
      {
        id: 'stu-001',
        name: 'Priya Sharma',
        parentEmail: 'parent.priya@example.com',
        feePaid: false,
        lastPaidDate: null,
      },
      {
        id: 'stu-002',
        name: 'Arjun Mehta',
        parentEmail: 'parent.arjun@example.com',
        feePaid: true,
        lastPaidDate: new Date('2026-03-01'),
      },
      {
        id: 'stu-003',
        name: 'Sneha Iyer',
        parentEmail: 'parent.sneha@example.com',
        feePaid: false,
        lastPaidDate: new Date('2025-12-10'),
      },
    ];
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
