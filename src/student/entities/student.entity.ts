/**
 * Domain model for a student and fee status (in-memory until a DB is added).
 */
export class Student {
  id!: string;
  name!: string;
  parentEmail!: string;
  feePaid!: boolean;
  /** Null when never paid in our records */
  lastPaidDate!: Date | null;
}
