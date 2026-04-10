import { randomUUID } from 'crypto';
import { Student } from '../../student/entities/student.entity';

/** Simple check — invalid seeded rows intentionally break this for failure-path testing. */
export function looksLikeValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const FIRST_INDIAN = [
  'Aarav',
  'Ananya',
  'Dev',
  'Diya',
  'Ishaan',
  'Kavya',
  'Neha',
  'Rohan',
  'Saanvi',
  'Vihaan',
  'Aditya',
  'Priya',
  'Arjun',
  'Sneha',
  'Kabir',
  'Meera',
  'Riya',
  'Vikram',
  'Anika',
  'Raj',
];

const FIRST_WESTERN = [
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Ethan',
  'Sophia',
  'Mason',
  'Isabella',
  'James',
  'Mia',
  'Benjamin',
  'Charlotte',
  'Lucas',
  'Amelia',
  'Henry',
  'Harper',
  'Alexander',
  'Evelyn',
  'Daniel',
];

const LAST_NAMES = [
  'Sharma',
  'Patel',
  'Iyer',
  'Reddy',
  'Nair',
  'Kapoor',
  'Menon',
  'Desai',
  'Khan',
  'Singh',
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Garcia',
  'Miller',
  'Davis',
  'Wilson',
  'Taylor',
  'Anderson',
];

const VALID_DOMAINS = ['gmail.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'proton.me'];

/** Deliberately invalid values for exercising validation / email failure paths (~5%). */
const INVALID_EMAIL_SAMPLES = [
  'not-an-email',
  'missing-at-sign.com',
  'bad@',
  '@nodomain.com',
  'spaces in@email.com',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

export interface GeneratedStudentStats {
  total: number;
  feePaidTrue: number;
  feePaidFalse: number;
  invalidEmail: number;
  lastPaidNull: number;
}

/**
 * Builds `count` students (50–100 typical) with mixed Indian/Western names and realistic fee patterns.
 */
export function generateStudents(count: number): { students: Student[]; stats: GeneratedStudentStats } {
  const students: Student[] = [];
  const stats: GeneratedStudentStats = {
    total: count,
    feePaidTrue: 0,
    feePaidFalse: 0,
    invalidEmail: 0,
    lastPaidNull: 0,
  };

  for (let i = 0; i < count; i += 1) {
    const useIndianFirst = Math.random() < 0.55;
    const first = useIndianFirst ? pick(FIRST_INDIAN) : pick(FIRST_WESTERN);
    const last = pick(LAST_NAMES);
    const name = `${first} ${last}`;

    const roll = randomInt(0, 99);
    let parentEmail: string;
    let feePaid: boolean;
    let lastPaidDate: Date | null;

    // ~5% invalid email (still assign fee fields for variety)
    if (roll < 5) {
      parentEmail = pick(INVALID_EMAIL_SAMPLES);
      stats.invalidEmail += 1;
      feePaid = Math.random() < 0.25;
      lastPaidDate =
        Math.random() < 0.4 ? null : daysAgo(randomInt(20, 120));
    } else {
      const slug = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
      parentEmail = `${slug}${randomInt(1, 9999)}@${pick(VALID_DOMAINS)}`;

      // ~35% paid recently
      if (roll < 40) {
        feePaid = true;
        lastPaidDate = daysAgo(randomInt(1, 45));
      }
      // ~40% unpaid, overdue 1–3 months
      else if (roll < 80) {
        feePaid = false;
        lastPaidDate = daysAgo(randomInt(30, 95));
      }
      // ~15% unpaid, never paid in records
      else if (roll < 95) {
        feePaid = false;
        lastPaidDate = null;
      }
      // ~5% edge: marked paid but missing date (bad data)
      else {
        feePaid = true;
        lastPaidDate = null;
      }
    }

    if (feePaid) {
      stats.feePaidTrue += 1;
    } else {
      stats.feePaidFalse += 1;
    }
    if (lastPaidDate === null) {
      stats.lastPaidNull += 1;
    }

    students.push({
      id: randomUUID(),
      name,
      parentEmail,
      feePaid,
      lastPaidDate,
    });
  }

  return { students, stats };
}
