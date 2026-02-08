const DAY_MAP = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export function buildRRule(type, startDate) {
  if (type === 'none' || !type) return null;

  const date = new Date(startDate);

  switch (type) {
    case 'daily':
      return 'FREQ=DAILY';
    case 'weekly': {
      const dayOfWeek = DAY_MAP[date.getDay() === 0 ? 6 : date.getDay() - 1];
      return `FREQ=WEEKLY;BYDAY=${dayOfWeek}`;
    }
    case 'monthly': {
      const dayOfMonth = date.getDate();
      return `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`;
    }
    default:
      return null;
  }
}

const RECURRENCE_LABELS = {
  DAILY: 'Ogni giorno',
  WEEKLY: 'Ogni settimana',
  MONTHLY: 'Ogni mese',
};

export function describeRecurrence(rruleString) {
  if (!rruleString) return 'Non ricorrente';

  try {
    if (rruleString.includes('FREQ=DAILY')) return RECURRENCE_LABELS.DAILY;
    if (rruleString.includes('FREQ=WEEKLY')) return RECURRENCE_LABELS.WEEKLY;
    if (rruleString.includes('FREQ=MONTHLY')) return RECURRENCE_LABELS.MONTHLY;
    return rruleString;
  } catch {
    return rruleString;
  }
}
