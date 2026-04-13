import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { Student } from '../student/entities/student.entity';
import { StudentService } from '../student/student.service';
import { FeeReminderService } from './fee-reminder.service';

describe('FeeReminderService', () => {
  let service: FeeReminderService;
  let emailSend: jest.Mock;

  beforeEach(async () => {
    const students: Student[] = [
      {
        id: '1',
        name: 'Eligible',
        parentEmail: 'parent@test.com',
        feePaid: false,
        lastPaidDate: null,
      },
      {
        id: '2',
        name: 'Paid Student',
        parentEmail: 'paid@test.com',
        feePaid: true,
        lastPaidDate: new Date(),
      },
      {
        id: '3',
        name: 'Invalid Email',
        parentEmail: 'bad-email',
        feePaid: false,
        lastPaidDate: null,
      },
    ];

    emailSend = jest.fn().mockResolvedValue({ ok: true });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeReminderService,
        {
          provide: StudentService,
          useValue: {
            findAll: jest.fn().mockReturnValue(students),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendMail: emailSend,
            generateEmailContent: jest.fn().mockReturnValue({
              subject: 'test-subject',
              text: 'test-text',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FeeReminderService>(FeeReminderService);
  });

  it('sends one email per selected unpaid student and skips invalid rows', async () => {
    const result = await service.sendRemindersToUnpaid();
    expect(result.attempted).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(emailSend.mock.calls[0][0].to).toBe('parent@test.com');
  });
});
