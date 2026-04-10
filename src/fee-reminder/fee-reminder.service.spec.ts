import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { Student } from '../student/entities/student.entity';
import { StudentService } from '../student/student.service';
import { FeeReminderService } from './fee-reminder.service';

describe('FeeReminderService', () => {
  let service: FeeReminderService;
  let emailSend: jest.Mock;

  beforeEach(async () => {
    const unpaid: Student[] = [
      {
        id: '1',
        name: 'Test',
        parentEmail: 'parent@test.com',
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
            findWithUnpaidFees: jest.fn().mockReturnValue(unpaid),
          },
        },
        {
          provide: EmailService,
          useValue: { sendMail: emailSend },
        },
      ],
    }).compile();

    service = module.get<FeeReminderService>(FeeReminderService);
  });

  it('sends one email per unpaid student', async () => {
    const result = await service.sendRemindersToUnpaid();
    expect(result.attempted).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(emailSend.mock.calls[0][0].to).toBe('parent@test.com');
  });
});
