import { Student } from '../../student/entities/student.entity';

export type ReminderLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FeeReminderEmailContent {
  subject: string;
  text: string;
}

/**
 * Builds dynamic reminder templates with different tone by reminder level.
 */
export function buildFeeReminderContent(
  student: Student,
  reminderLevel: ReminderLevel,
): FeeReminderEmailContent {
  const openingByLevel: Record<ReminderLevel, string> = {
    LOW: `This is a gentle reminder that the fee payment for ${student.name} is pending.`,
    MEDIUM: `This is a reminder that the fee payment for ${student.name} is still outstanding.`,
    HIGH: `Urgent: the fee payment for ${student.name} remains unpaid and requires immediate attention.`,
  };

  const actionByLevel: Record<ReminderLevel, string> = {
    LOW: 'Please complete the payment when convenient.',
    MEDIUM: 'Please complete the payment at the earliest to avoid interruption.',
    HIGH: 'Please clear the dues immediately to avoid service disruption.',
  };

  return {
    subject: `[${reminderLevel}] Fee Reminder - ${student.name}`,
    text: [
      'Dear Parent/Guardian,',
      '',
      openingByLevel[reminderLevel],
      '',
      actionByLevel[reminderLevel],
      'If you have already paid, please ignore this message.',
      '',
      'Thank you,',
      'Samudhra Fees Office',
    ].join('\n'),
  };
}
