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
  seeder: {
    /** When true, SeederStartupHook runs reset+seed on app bootstrap. */
    runOnStartup: process.env.SEED_ON_STARTUP === 'true',
    /** Target row count (clamped to 50–100 in {@link SeederService}). */
    studentCount: (() => {
      const v = parseInt(process.env.SEED_STUDENT_COUNT ?? '75', 10);
      return Number.isFinite(v) ? v : 75;
    })(),
  },
});
