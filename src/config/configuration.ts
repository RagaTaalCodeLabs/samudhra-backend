/**
 * Central configuration factory for @nestjs/config.
 * Maps environment variables to typed keys used across the app.
 */
export default () => ({
  gmail: {
    user: process.env.GMAIL_USER ?? '',
    appPassword: process.env.GMAIL_APP_PASSWORD ?? '',
  },
  feeReminder: {
    /** When true, SMTP is skipped and sends are logged only (useful for local dev). */
    dryRun: process.env.FEE_REMINDER_DRY_RUN === 'true',
  },
});
