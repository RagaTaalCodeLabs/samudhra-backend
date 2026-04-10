import { Controller, Get, Param } from '@nestjs/common';
import { StudentService } from './student.service';

/**
 * Read-only API for inspecting student records (replace with auth + admin role in production).
 */
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  list() {
    return this.studentService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.studentService.findOne(id) ?? { error: 'Not found' };
  }
}
