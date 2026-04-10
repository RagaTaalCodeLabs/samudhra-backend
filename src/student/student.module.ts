import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentRepository } from './student.repository';
import { StudentService } from './student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentRepository, StudentService],
  exports: [StudentService],
})
export class StudentModule {}
