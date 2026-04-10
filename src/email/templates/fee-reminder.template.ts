/**
 * Fee reminder email template — adjust copy here without touching mail transport logic.
 */
export interface FeeReminderTemplateParams {
  studentName: string;
}

export const FEE_REMINDER_SUBJECT = 'Reminder: Outstanding school fees';

export function buildFeeReminderText(params: FeeReminderTemplateParams): string {
  const { studentName } = params;
  return [
    'Dear Parent/Guardian,',
    '',
    `This is a friendly reminder that the fee payment for ${studentName} is still outstanding.`,
    '',
    'Please settle the amount at your earliest convenience. If you have already paid, you may disregard this message.',
    '',
    'Thank you,',
    'Samudhra Fees Office',
  ].join('\n');
}
