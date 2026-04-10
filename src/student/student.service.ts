import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { StudentRepository } from './student.repository';

@Injectable()
export class StudentService {
  constructor(private readonly repository: StudentRepository) {}

  findAll(): Student[] {
    return this.repository.findAll();
  }

  /** Students who still owe fees (used by fee reminder job). */
  findWithUnpaidFees(): Student[] {
    return this.repository.findUnpaid();
  }

  findOne(id: string): Student | undefined {
    return this.repository.findById(id);
  }
}
