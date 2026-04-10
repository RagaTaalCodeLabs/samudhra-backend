import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StudentRepository } from '../student/student.repository';
import { SeederService } from './seeder.service';

describe('SeederService', () => {
  let service: SeederService;
  let repository: StudentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        StudentRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'seeder.studentCount') {
                return 52;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(SeederService);
    repository = module.get(StudentRepository);
  });

  it('resetAndReseed clears and fills with clamped count', async () => {
    const { count } = await service.resetAndReseed({ count: 52 });
    expect(count).toBe(52);
    expect(repository.findAll()).toHaveLength(52);
  });

  it('clamps count to 50–100', async () => {
    await service.resetAndReseed({ count: 10 });
    expect(repository.findAll().length).toBe(50);
    await service.resetAndReseed({ count: 500 });
    expect(repository.findAll().length).toBe(100);
  });
});
