import { generateStudents, looksLikeValidEmail } from './student.generator';

describe('student.generator', () => {
  it('generates the requested count with UUID ids', () => {
    const { students, stats } = generateStudents(60);
    expect(students).toHaveLength(60);
    expect(stats.total).toBe(60);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const s of students) {
      expect(s.id).toMatch(uuid);
      expect(s.name.length).toBeGreaterThan(0);
    }
  });

  it('includes some invalid-email rows for failure testing', () => {
    const { students } = generateStudents(200);
    const invalid = students.filter((s) => !looksLikeValidEmail(s.parentEmail));
    expect(invalid.length).toBeGreaterThan(0);
  });
});
