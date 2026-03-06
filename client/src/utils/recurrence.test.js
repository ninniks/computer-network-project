import { buildRRule, describeRecurrence } from './recurrence';

describe('buildRRule', () => {
  it("'none' → null", () => {
    expect(buildRRule('none', new Date())).toBeNull();
  });

  it('null → null', () => {
    expect(buildRRule(null, new Date())).toBeNull();
  });

  it("'daily' → FREQ=DAILY", () => {
    expect(buildRRule('daily', new Date('2024-01-01'))).toBe('FREQ=DAILY');
  });

  it("'weekly' con lunedì → FREQ=WEEKLY;BYDAY=MO", () => {
    // 2024-01-08 is a Monday (getDay() === 1)
    expect(buildRRule('weekly', new Date('2024-01-08'))).toBe('FREQ=WEEKLY;BYDAY=MO');
  });

  it("'weekly' con domenica → FREQ=WEEKLY;BYDAY=SU", () => {
    // 2024-01-07 is a Sunday (getDay() === 0)
    expect(buildRRule('weekly', new Date('2024-01-07'))).toBe('FREQ=WEEKLY;BYDAY=SU');
  });

  it("'monthly' con giorno 15 → FREQ=MONTHLY;BYMONTHDAY=15", () => {
    expect(buildRRule('monthly', new Date('2024-01-15'))).toBe('FREQ=MONTHLY;BYMONTHDAY=15');
  });

  it("'monthly' con giorno 1 → FREQ=MONTHLY;BYMONTHDAY=1", () => {
    expect(buildRRule('monthly', new Date('2024-03-01'))).toBe('FREQ=MONTHLY;BYMONTHDAY=1');
  });

  it('tipo sconosciuto → null', () => {
    expect(buildRRule('yearly', new Date())).toBeNull();
  });
});

describe('describeRecurrence', () => {
  it('null → Non ricorrente', () => {
    expect(describeRecurrence(null)).toBe('Non ricorrente');
  });

  it("stringa vuota → Non ricorrente", () => {
    expect(describeRecurrence('')).toBe('Non ricorrente');
  });

  it("'FREQ=DAILY' → Ogni giorno", () => {
    expect(describeRecurrence('FREQ=DAILY')).toBe('Ogni giorno');
  });

  it("'FREQ=WEEKLY;BYDAY=MO' → Ogni settimana", () => {
    expect(describeRecurrence('FREQ=WEEKLY;BYDAY=MO')).toBe('Ogni settimana');
  });

  it("'FREQ=MONTHLY;BYMONTHDAY=1' → Ogni mese", () => {
    expect(describeRecurrence('FREQ=MONTHLY;BYMONTHDAY=1')).toBe('Ogni mese');
  });
});
